"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { COOKIE_CONSENT_CHANGED_EVENT } from "@/constants/cookie-consent";
import {
  hasAnalyticsConsent,
  loadCookieConsent,
} from "@/lib/cookie-consent-storage";
import {
  buildAnalyticsPagePath,
  normalizeGoogleAnalyticsId,
  normalizeYandexMetrikaId,
  trackGoogleAnalyticsPageView,
  trackYandexMetrikaPageView,
} from "@/lib/site-analytics";

type SiteAnalyticsProps = {
  googleAnalyticsId?: string;
  yandexMetrikaId?: string;
};

export function SiteAnalytics({
  googleAnalyticsId,
  yandexMetrikaId,
}: SiteAnalyticsProps) {
  const pathname = usePathname();
  const gaId = normalizeGoogleAnalyticsId(googleAnalyticsId);
  const ymCounterId = normalizeYandexMetrikaId(yandexMetrikaId);
  const hasCounters = gaId !== undefined || ymCounterId !== undefined;

  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const skipRouteTrackRef = useRef(true);

  const syncConsent = useCallback(() => {
    setAnalyticsAllowed(hasAnalyticsConsent(loadCookieConsent()));
  }, []);

  useEffect(() => {
    if (!hasCounters) {
      return;
    }
    syncConsent();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
    };
  }, [hasCounters, syncConsent]);

  useEffect(() => {
    if (analyticsAllowed) {
      skipRouteTrackRef.current = true;
    }
  }, [analyticsAllowed]);

  useEffect(() => {
    if (!analyticsAllowed || !hasCounters) {
      return;
    }

    const pagePath = buildAnalyticsPagePath(pathname);

    if (skipRouteTrackRef.current) {
      skipRouteTrackRef.current = false;
      return;
    }

    if (gaId) {
      trackGoogleAnalyticsPageView(gaId, pagePath);
    }
    if (ymCounterId !== undefined) {
      trackYandexMetrikaPageView(ymCounterId, pagePath);
    }
  }, [analyticsAllowed, hasCounters, pathname, gaId, ymCounterId]);

  if (!hasCounters || !analyticsAllowed) {
    return null;
  }

  return (
    <>
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="sk-store-google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      ) : null}
      {ymCounterId !== undefined ? (
        <>
          <Script id="sk-store-yandex-metrika" strategy="afterInteractive">
            {`
              (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {
                  if (document.scripts[j].src === r) { return; }
                }
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);
              })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
              ym(${ymCounterId}, "init", {
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true,
                webvisor: true
              });
            `}
          </Script>
          <noscript>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://mc.yandex.ru/watch/${ymCounterId}`}
                alt=""
                style={{ position: "absolute", left: "-9999px" }}
              />
            </div>
          </noscript>
        </>
      ) : null}
    </>
  );
}
