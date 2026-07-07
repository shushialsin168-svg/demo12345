import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import Receipt from "../components/Receipt";
import { StepBar } from "../components/Layout";
import { IconArrowLeft, IconCheck } from "../components/Icons";
import { submitOrder, type OrderPayload } from "../telegram";

type SendState = "idle" | "sending" | "sent" | "error";

export default function ThankYou({
  order,
  onHome,
}: {
  order: OrderPayload;
  onHome: () => void;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [sendState, setSendState] = useState<SendState>("idle");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const submittedRef = useRef(false);

  // On mount: capture the receipt, then send to Telegram.
  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const run = async () => {
      setSendState("sending");
      try {
        // Give React one paint to mount the offscreen receipt with images
        await new Promise((r) => setTimeout(r, 400));
        let dataUrl: string | undefined;
        if (receiptRef.current) {
          try {
            dataUrl = await toPng(receiptRef.current, {
              cacheBust: true,
              pixelRatio: 2,
              backgroundColor: "#ffffff",
            });
            setReceiptUrl(dataUrl);
          } catch (e) {
            console.warn("Receipt capture failed", e);
          }
        }
        const ok = await submitOrder(order, dataUrl);
        setSendState(ok ? "sent" : "error");
      } catch (e) {
        console.error(e);
        setSendState("error");
      }
    };
    run();
  }, [order]);

  const downloadReceipt = () => {
    if (!receiptUrl) return;
    const a = document.createElement("a");
    a.href = receiptUrl;
    a.download = `receipt-${order.invoice}.png`;
    a.click();
  };

  const printReceipt = () => {
    if (!receiptUrl) {
      window.print();
      return;
    }
    const w = window.open("", "_blank", "width=420,height=800");
    if (!w) return;
    w.document.write(`
      <html><head><title>Receipt ${order.invoice}</title>
      <style>body{margin:0;display:flex;justify-content:center;background:#fff;}
      img{max-width:100%;} @media print{@page{margin:0;} body{padding:0;}}</style>
      </head><body>
      <img src="${receiptUrl}" onload="setTimeout(()=>{window.print();window.close();},300)"/>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <div className="flex flex-col h-full bg-[#f2f7f5] relative">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 bg-[#e6f4ef]">
        <button
          onClick={onHome}
          className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-gray-600"
        >
          <IconArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex-1">
          🙏 អរគុណសម្រាប់ការទិញ
        </h1>
      </div>

      <StepBar step={3} />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-3 pb-8">
        <p className="text-xs text-gray-600 leading-relaxed">
          សម្គាល់: អ្នកអាចបញ្ជាទិញដោយប្រើព័ត៌មានខាងក្រោមមាន ពិន្ទុរបស់អ្នកនិងត្រូវរង់ចាំ
          បន្ទាប់ពីវិក័យប័ត្រត្រូវបានដំណើរការ និងបញ្ចប់។
        </p>

        <div className="mt-4">
          <div className="text-[#148c78] font-semibold">ព័ត៌មានការកុម្ម៉ង់</div>
          <div className="mt-2 text-sm space-y-1">
            <div>ឈ្មោះ: <span className="font-semibold">{order.customerName}</span></div>
            <div>លេខទូរស័ព្ទ: <span className="font-semibold">{order.customerPhone}</span></div>
            <div>លេខកូដ: <span className="font-semibold">{order.invoice}</span></div>
          </div>
        </div>

        {/* Telegram status */}
        <div className="mt-3">
          {sendState === "sending" && (
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              កំពុងផ្ញើទៅ ហាង...
            </div>
          )}
          {sendState === "sent" && (
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full">
              <IconCheck className="w-3 h-3" />
              បានផ្ញើទៅ ហាង រួចរាល់
            </div>
          )}
          {sendState === "error" && (
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 text-xs px-3 py-1.5 rounded-full">
              ⚠️ ការផ្ញើទៅ ហាង បរាជ័យ
            </div>
          )}
        </div>

        {/* Receipt preview */}
        <div className="mt-4">
          <div className="text-[#148c78] font-semibold mb-2">វិក័យប័ត្រ</div>
          <div className="bg-white rounded-2xl card-shadow p-3 flex justify-center overflow-hidden">
            {receiptUrl ? (
              <img
                src={receiptUrl}
                alt="Receipt"
                className="max-w-full rounded"
                style={{ maxHeight: 480 }}
              />
            ) : (
              <div className="scale-[0.85] origin-top">
                <Receipt ref={receiptRef} {...order} />
              </div>
            )}
          </div>

          {/* Hidden receipt element used purely for capture (kept mounted for
              consistent rendering even after preview switches to <img>). */}
          {receiptUrl && (
            <div style={{ position: "fixed", left: -9999, top: 0 }}>
              <Receipt ref={receiptRef} {...order} />
            </div>
          )}

          {/* <div className="mt-3 flex gap-2">
            <button
              onClick={printReceipt}
              className="flex-1 bg-[#148c78] text-white rounded-full py-2.5 text-sm font-medium"
            >
              🖨️ បោះពុម្ព
            </button>
            <button
              onClick={downloadReceipt}
              disabled={!receiptUrl}
              className="flex-1 bg-white border border-[#148c78] text-[#148c78] disabled:opacity-40 rounded-full py-2.5 text-sm font-medium"
            >
              ⬇️ ទាញយក
            </button>
          </div> */}
        </div>

        <button
          onClick={onHome}
          className="mt-6 w-full bg-gray-800 text-white rounded-full py-3 text-sm font-medium"
        >
          ត្រឡប់ទៅទំព័រដើម
        </button>
      </div>
    </div>
  );
}
