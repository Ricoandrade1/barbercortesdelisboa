import React from "react";
import { Button } from "@/components/ui/button";

interface DownloadIphoneButtonProps {}

export function DownloadIphoneButton({}: DownloadIphoneButtonProps) {
  return (
    <Button asChild size="sm" variant="ghost">
      <a href="https://barbeirocortedelisboa.netlify.app/">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-apple"><path d="M20.7 11.2c-.3-1-1.1-1.8-1.9-2.1-1.4-.5-2.8-.8-4.2-.8-1.4 0-2.8.3-4.2.8-1 0-1.8.8-2.1 1.9-.3.8-.3 1.7 0 2.5.3.8.8 1.5 1.5 2.1.7.6 1.6 1.1 2.5 1.4.3.1.7.2 1 .2 1.4 0 2.8-.3 4.2-.8 1.1-.4 1.9-1.2 2.2-2.2.2-.8.2-1.7-.1-2.5-.2-.8-.8-1.5-1.5-2.1-.7-.5-1.6-1-2.5-1.3-.3-.1-.7-.2-1-.2-1.4 0-2.8.3-4.2.8-1.1.4-1.9 1.2-2.2 2.2-.2.8-.2 1.7.1 2.5.2.8.8 1.5 1.5 2.1.7.6 1.6 1.1 2.5 1.4.3.1.7.2 1 .2 1.4 0 2.8-.3 4.2-.8 1.1-.4 1.9-1.2 2.2-2.2.2-.8.2-1.7-.1-2.5-.3-.8-.8-1.5-1.5-2.1-.7-.5-1.6-1-2.5-1.3-.3-.1-.7-.2-1-.2"/><path d="M12 16c-1.4 0-2.8-.3-4.2-.8"/><path d="M12 16c1.4 0 2.8-.3 4.2-.8"/></svg>
        <span className="text-xs">Instalar App</span>
      </a>
    </Button>
  );
}
