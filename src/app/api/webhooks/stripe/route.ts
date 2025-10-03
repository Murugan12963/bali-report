import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("❌ Stripe webhook: Missing signature");
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 },
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("❌ Stripe webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 },
      );
    }

    // Handle the event
    console.log(`✅ Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("💰 Checkout completed:", {
          sessionId: session.id,
          customerId: session.customer,
          amountTotal: session.amount_total,
          currency: session.currency,
          paymentStatus: session.payment_status,
        });

        // TODO: Save to database
        // - Create subscription record
        // - Update user account
        // - Send confirmation email
        // - Allocate 20% to BPD fund

        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("📅 Subscription created:", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          priceId: subscription.items.data[0]?.price.id,
        });

        // TODO: Save to database
        // - Create/update subscription record
        // - Update user tier (basic/premium/enterprise)
        // - Send welcome email
        // - Track for BPD allocation

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("🔄 Subscription updated:", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });

        // TODO: Update database
        // - Update subscription status
        // - Handle tier changes
        // - Handle cancellation requests

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("❌ Subscription deleted:", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        });

        // TODO: Update database
        // - Mark subscription as cancelled
        // - Downgrade user to free tier
        // - Send cancellation confirmation

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("✅ Payment succeeded:", {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          amountPaid: invoice.amount_paid,
          currency: invoice.currency,
          subscriptionId: invoice.subscription,
        });

        // TODO: Update database
        // - Record payment
        // - Extend subscription period
        // - Update BPD fund allocation (20% of revenue)
        // - Send receipt email

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.error("❌ Payment failed:", {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          amountDue: invoice.amount_due,
          attemptCount: invoice.attempt_count,
        });

        // TODO: Handle payment failure
        // - Send payment failure notification
        // - Update subscription status
        // - Trigger retry logic

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("💳 Payment intent succeeded:", {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        });

        // TODO: Handle one-time donations
        // - Record donation to BPD fund
        // - Send thank you email
        // - Update campaign progress if applicable

        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

// Disable body parsing, need raw body for signature verification
export const runtime = "edge";
export const dynamic = "force-dynamic";
