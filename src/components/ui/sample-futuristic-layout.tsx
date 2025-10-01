"use client";

import React from "react";
import { FuturisticButton } from "./futuristic-button";
import { FuturisticCard } from "./futuristic-card";
import { FuturisticProgress } from "./futuristic-progress";
import { FuturisticCircularIndicator } from "./futuristic-circular-indicator";

export function SampleFuturisticLayout() {
  return (
    <div className="min-h-screen bg-dark-bg p-8 text-dark-text">
      {/* Background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#2E354A_1px,transparent_1px),linear-gradient(to_bottom,#2E354A_1px,transparent_1px)] bg-[size:64px_64px] opacity-10" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-sans text-3xl font-bold tracking-wider text-primary-500 [text-shadow:0_0_10px_rgba(0,255,204,0.5)]">
            SYSTEM DASHBOARD
          </h1>
          <div className="flex gap-4">
            <FuturisticButton variant="ghost" size="icon">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </FuturisticButton>
            <FuturisticButton variant="ghost" size="icon">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </FuturisticButton>
          </div>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* System Status */}
          <FuturisticCard
            variant="highlight"
            gridOverlay
            header={
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-lg font-semibold">System Status</h2>
                <span className="flex h-2 w-2 rounded-full bg-primary-500 shadow-glow" />
              </div>
            }
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>CPU Usage</span>
                  <span>64%</span>
                </div>
                <FuturisticProgress value={64} showValue segments={5} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Memory</span>
                  <span>82%</span>
                </div>
                <FuturisticProgress
                  value={82}
                  showValue
                  segments={5}
                  variant="secondary"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Network</span>
                  <span>45%</span>
                </div>
                <FuturisticProgress
                  value={45}
                  showValue
                  segments={5}
                  variant="accent"
                />
              </div>
            </div>
          </FuturisticCard>

          {/* Metrics */}
          <FuturisticCard
            variant="highlight"
            gridOverlay
            header={
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-lg font-semibold">Key Metrics</h2>
                <FuturisticButton variant="ghost" size="sm">
                  View All
                </FuturisticButton>
              </div>
            }
          >
            <div className="flex justify-center gap-4">
              <FuturisticCircularIndicator
                value={75}
                label="Efficiency"
                sublabel="Current"
                size="sm"
              />
              <FuturisticCircularIndicator
                value={92}
                label="Uptime"
                sublabel="24h"
                variant="secondary"
                size="sm"
              />
              <FuturisticCircularIndicator
                value={88}
                label="Security"
                sublabel="Score"
                variant="accent"
                size="sm"
              />
            </div>
          </FuturisticCard>

          {/* Actions */}
          <FuturisticCard
            variant="highlight"
            gridOverlay
            header={
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-lg font-semibold">Quick Actions</h2>
              </div>
            }
          >
            <div className="grid grid-cols-2 gap-4">
              <FuturisticButton>
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync
              </FuturisticButton>
              <FuturisticButton variant="secondary">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Lock
              </FuturisticButton>
              <FuturisticButton variant="outline">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </FuturisticButton>
              <FuturisticButton variant="gradient">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Power
              </FuturisticButton>
            </div>
          </FuturisticCard>
        </div>
      </div>
    </div>
  );
}