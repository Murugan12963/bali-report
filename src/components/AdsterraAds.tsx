"use client";

import { useEffect, useRef, useState } from "react";

interface AdsterraAdsProps {
  type: "banner" | "social-bar" | "native" | "popunder";
  className?: string;
  zoneId?: string;
}

const AdsterraAds: React.FC<AdsterraAdsProps> = ({
  type,
  className = "",
  zoneId = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_ADS || "5336445",
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [adBlocked, setAdBlocked] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !zoneId || !adRef.current) return;

    const loadAd = async (attempt: number = 0) => {
      if (!adRef.current) return;

      // Clear previous attempts
      adRef.current.innerHTML = "";
      setAdLoaded(false);

      try {
        // Method 1: Primary Adsterra script loading
        if (attempt === 0) {
          console.log("Loading Adsterra ads - Method 1: Primary script");
          
          // Set up Adsterra configuration
          const atOptions = {
            key: zoneId,
            format: "iframe",
            height: type === "banner" ? 90 : 250,
            width: type === "banner" ? 728 : 300,
            params: {}
          };

          // Make atOptions globally available
          (window as any).atOptions = atOptions;

          const script = document.createElement("script");
          script.type = "text/javascript";
          script.async = true;
          script.src = `https://www.highperformanceformats.com/atTag.js`;
          
          script.onload = () => {
            console.log("✅ Adsterra script loaded successfully");
            setAdLoaded(true);
          };

          script.onerror = (error) => {
            console.log("❌ Primary script failed:", error);
            setTimeout(() => setLoadAttempt(attempt + 1), 1000);
          };

          document.head.appendChild(script);

          // Check if ad container gets populated
          setTimeout(() => {
            if (adRef.current) {
              const hasContent = adRef.current.children.length > 0 || adRef.current.innerHTML.trim().length > 0;
              if (!hasContent && !adLoaded) {
                console.log("No content loaded, trying next method...");
                setLoadAttempt(attempt + 1);
              }
            }
          }, 5000);
        }

        // Method 2: Alternative Adsterra domain
        else if (attempt === 1) {
          console.log("Loading Adsterra ads - Method 2: Alternative domain");
          
          const atOptions = {
            key: zoneId,
            format: "iframe", 
            height: type === "banner" ? 90 : 250,
            width: type === "banner" ? 728 : 300,
            params: {}
          };

          (window as any).atOptions = atOptions;

          const script = document.createElement("script");
          script.type = "text/javascript";  
          script.async = true;
          script.src = `https://www.displaycontentnetwork.com/atTag.js`;
          
          script.onload = () => {
            console.log("✅ Alternative domain script loaded");
            setAdLoaded(true);
          };

          script.onerror = (error) => {
            console.log("❌ Alternative script failed:", error);
            setTimeout(() => setLoadAttempt(attempt + 1), 1000);
          };

          document.head.appendChild(script);

          setTimeout(() => {
            if (adRef.current) {
              const hasContent = adRef.current.children.length > 0 || adRef.current.innerHTML.trim().length > 0;
              if (!hasContent && !adLoaded) {
                console.log("Alternative method failed, trying iframe...");
                setLoadAttempt(attempt + 1);
              }
            }
          }, 5000);
        }

        // Method 3: Direct iframe approach 
        else if (attempt === 2) {
          console.log("Loading Adsterra ads - Method 3: Direct iframe");
          
          const iframe = document.createElement("iframe");
          iframe.style.border = "none";
          iframe.style.overflow = "hidden";
          iframe.style.background = "transparent";
          iframe.width = (type === "banner" ? 728 : 300).toString();
          iframe.height = (type === "banner" ? 90 : 250).toString();
          iframe.setAttribute("scrolling", "no");
          iframe.setAttribute("allowtransparency", "true");
          
          // Use proper Adsterra iframe URL
          iframe.src = `https://www.highperformanceformats.com/iframe.php?zone=${zoneId}`;
          
          iframe.onload = () => {
            console.log("✅ Iframe ad loaded");
            setAdLoaded(true);
          };

          iframe.onerror = (error) => {
            console.log("❌ Iframe failed:", error);
            setTimeout(() => setLoadAttempt(attempt + 1), 1000);
          };

          if (adRef.current) {
            adRef.current.appendChild(iframe);
          }

          setTimeout(() => {
            if (!adLoaded) {
              console.log("Iframe method timeout, trying fallback...");
              setLoadAttempt(attempt + 1);
            }
          }, 4000);
        }

        // Method 4: Manual ad container (fallback)
        else if (attempt === 3) {
          console.log("Loading Adsterra ads - Method 4: Manual container");
          
          const adContainer = document.createElement("div");
          adContainer.id = `adsterra_${zoneId}_${Date.now()}`;
          adContainer.style.width = (type === "banner" ? 728 : 300) + "px";
          adContainer.style.height = (type === "banner" ? 90 : 250) + "px";
          adContainer.style.background = "#f8f9fa";
          adContainer.style.border = "1px solid #e9ecef";
          adContainer.style.borderRadius = "4px";
          adContainer.style.display = "flex";
          adContainer.style.alignItems = "center";
          adContainer.style.justifyContent = "center";
          adContainer.style.position = "relative";

          // Create loading placeholder
          adContainer.innerHTML = `
            <div style="text-align: center; font-family: Arial, sans-serif; color: #6c757d;">
              <div style="font-size: 14px; margin-bottom: 8px;">📢 Advertisement</div>
              <div style="font-size: 11px;">Loading sponsored content...</div>
            </div>
          `;

          if (adRef.current) {
            adRef.current.appendChild(adContainer);
          }

          // Try to inject Adsterra code manually
          try {
            const manualScript = `
              (function() {
                var atOptions = {
                  'key': '${zoneId}',
                  'format': 'iframe',
                  'height': ${type === "banner" ? 90 : 250},
                  'width': ${type === "banner" ? 728 : 300},
                  'params': {}
                };
                document.write('<script type="text/javascript" src="https://www.highperformanceformats.com/atTag.js"></' + 'script>');
              })();
            `;
            
            const scriptElement = document.createElement("script");
            scriptElement.innerHTML = manualScript;
            document.head.appendChild(scriptElement);
            
            setAdLoaded(true);
          } catch (e) {
            console.log("Manual injection failed:", e);
            setTimeout(() => setLoadAttempt(attempt + 1), 2000);
          }
        }

        // Method 5: Final placeholder
        else {
          console.log("All methods failed, showing final placeholder");
          setAdBlocked(true);
          
          const placeholder = document.createElement("div");
          placeholder.style.width = (type === "banner" ? 728 : 300) + "px";
          placeholder.style.height = (type === "banner" ? 90 : 250) + "px";
          placeholder.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
          placeholder.style.color = "white";
          placeholder.style.display = "flex";
          placeholder.style.alignItems = "center";
          placeholder.style.justifyContent = "center";
          placeholder.style.borderRadius = "8px";
          placeholder.style.fontFamily = "Arial, sans-serif";
          
          placeholder.innerHTML = `
            <div style="text-align: center;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">🌟 Bali Report</div>
              <div style="font-size: 12px; opacity: 0.9;">Supporting Independent Journalism</div>
            </div>
          `;
          
          if (adRef.current) {
            adRef.current.appendChild(placeholder);
          }
        }

      } catch (error) {
        console.log("❌ Ad loading error:", error);
        setTimeout(() => setLoadAttempt(attempt + 1), 1000);
      }
    };

    // Start the ad loading process
    loadAd(loadAttempt);

    // Cleanup function
    return () => {
      if (adRef.current) {
        adRef.current.innerHTML = "";
      }
    };
  }, [type, zoneId, loadAttempt]);

  return (
    <div className={`adsterra-container ${className}`}>
      <div
        ref={adRef}
        className="adsterra-ads"
        style={{
          minHeight: type === "banner" ? "90px" : "250px",
          minWidth: type === "banner" ? "728px" : "300px",
          position: "relative",
          margin: "0 auto",
        }}
      />
      
      {/* Loading indicator */}
      {!adLoaded && !adBlocked && (
        <div 
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "12px",
            color: "#6c757d",
            pointerEvents: "none",
          }}
        >
          Loading ads...
        </div>
      )}
    </div>
  );
};

export default AdsterraAds;
