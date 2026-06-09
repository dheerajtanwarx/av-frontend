"use client";

import { Ic } from "./icons";
import { usePdp } from "./PdpContext";

export default function Toast() {
  const { toast, toastVisible, closeToast } = usePdp();

  return (
    <div className={`toast${toastVisible ? " show" : ""}`}>
      <button className="tclose" onClick={closeToast} aria-label="Dismiss">
        ×
      </button>
      <div className="tthumb">
        {toast && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={toast.thumb} alt="" />
        )}
      </div>
      <div className="tinfo">
        <div className="ok">{Ic.check} Added to bag</div>
        <div className="tn">{toast?.name ?? ""}</div>
        <div className="tv">{toast?.variant ?? ""}</div>
        <span className="tgo">View bag →</span>
      </div>
    </div>
  );
}
