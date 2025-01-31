import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const ShareButton = () => {
  const [showQR, setShowQR] = useState(false);
  const appDownloadLink = "https://bosswallet.netlify.app/";

  return (
    <AlertDialog open={showQR} onOpenChange={setShowQR}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          Compartilhar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Instalar Boss Wallet</AlertDialogTitle>
          <AlertDialogDescription>
            Escaneie o código QR abaixo para instalar o aplicativo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-center p-4">
          <QRCodeCanvas
            value={appDownloadLink}
            size={200}
            level={"H"} // Alto nível de correção de erro
            includeMargin={true}
          />
        </div>
        <AlertDialogAction asChild>
          <Button variant="outline" onClick={() => setShowQR(false)}>
            Fechar
          </Button>
        </AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ShareButton;
