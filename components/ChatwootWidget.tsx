"use client";

import Script from "next/script";

export const ChatwootWidget = () => {
  return (
    <Script
      id="chatwoot"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
          (function(d,t) {
            var BASE_URL="https://app.chatwoot.com";
            var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
            g.src=BASE_URL+"/packs/js/sdk.js";
            g.async = true;
            s.parentNode.insertBefore(g,s);
            g.onload=function(){
              window.chatwootSDK.run({
                websiteToken: 'cXcA6jZPVwTVzXXSpVDBh5zu',
                baseUrl: BASE_URL
              })
            }
          })(document,"script");
        `,
      }}
    />
  );
};
