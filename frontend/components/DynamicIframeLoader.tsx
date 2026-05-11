"use client";

import { getData } from "@/lib/api";
import { getAuthToken } from "@/lib/authStorage";
import { useEffect, useState } from "react";
import Script from "next/script";

function getUserIdFromToken() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || null;
  } catch (e) {
    return null;
  }
}

export default function DynamicIframeLoader({
  postLogin = false,
}: {
  postLogin?: boolean;
}) {
  const [iframeUrl, setIframeUrl] = useState<string>("");

  useEffect(() => {
    const fetchIframe = async () => {
      try {
        const { data } = await getData("/api/admin/integration");
        const scriptStr = data?.integration?.script;

        if (scriptStr) {
          const userId = getUserIdFromToken();
          let url = "";

          const scriptTagMatch = scriptStr.match(
            /<script[^>]+src=["']([^"']+)["']/i,
          );
          if (scriptTagMatch) {
            url = scriptTagMatch[1];
          }

          if (userId && postLogin) {
            url = `${url}${url.includes("?") ? "&" : "?"}userId=${userId}`;
          }

          setIframeUrl(url);

          const agentIdMatch = url.match(/agentId=([a-fA-F0-9-]+)/);
          const agentChainIdMatch = url.match(/agentchainId=([a-fA-F0-9-]+)/);
          const chatbotIdMatch = url.match(/chatbotId=([a-fA-F0-9-]+)/);

          const chatbotId =
            agentIdMatch?.[1] ||
            agentChainIdMatch?.[1] ||
            chatbotIdMatch?.[1] ||
            null;

          if (chatbotId && typeof document !== "undefined") {
            // Set simple cookie
            document.cookie = `atenxion-chatbot-id=${chatbotId}; path=/; max-age=31536000`;
          }
        }
      } catch (err) {
        console.log("Error while fetching iframe:", err);
        setIframeUrl("");
      }
    };
    fetchIframe();
  }, [postLogin]);

  if (!iframeUrl) return null;

  return <Script src={iframeUrl} strategy="afterInteractive" />;
}
