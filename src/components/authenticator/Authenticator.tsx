import React, { useState, useEffect } from "react";
import * as OTPAuth from "otpauth";;
import * as QRCode from "qrcode";

export default function TwoFAFrontend() {
  const [qr, setQr] = useState<string>("");
  const [secret, setSecret] = useState<OTPAuth.Secret | null>(null);
  const [code, setCode] = useState<string>("");

  // Load secret from localStorage on mount
  useEffect(() => {
    const savedSecret = localStorage.getItem("totp-secret");
    if (savedSecret) {
      setSecret(OTPAuth.Secret.fromBase32(savedSecret));
    }
  }, []);

  // Create new secret + QR code
  const setup = async () => {
    const newSecret = new OTPAuth.Secret();
    setSecret(newSecret);

    // Save in localStorage
    localStorage.setItem("totp-secret", newSecret.base32);

    const totp = new OTPAuth.TOTP({
      issuer: "MyReactApp",
      label: "user@example.com",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: newSecret
    });

    const uri = totp.toString();
    const qrCodeData = await QRCode.toDataURL(uri);
    setQr(qrCodeData);
  };

  // Verify user input
  const verify = () => {
    if (!secret) return alert("❌ No secret found, please setup first.");

    const totp = new OTPAuth.TOTP({
      issuer: "MyReactApp",
      label: "user@example.com",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret
    });

    const delta = totp.validate({ token: code });
    if (delta === null) {
      alert("❌ Invalid code");
    } else {
      alert("✅ Success! Code verified");
    }
  };

  return (
    <div className="p-4 space-y-4">
      {!secret && (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={setup}
        >
          Setup 2FA
        </button>
      )}

      {qr && (
        <div>
          <p>Scan this QR with Microsoft Authenticator:</p>
          <img src={qr} alt="QR Code" className="border p-2" />
        </div>
      )}

      {secret && (
        <div>
          <input
            type="text"
            className="border p-2 mr-2"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={verify}
          >
            Verify
          </button>
        </div>
      )}
    </div>
  );
}
