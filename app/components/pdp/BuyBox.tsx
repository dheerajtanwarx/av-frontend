"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { colorImages, type AccordionItem, type PdpColor, type PdpProduct } from "../../lib/pdp-data";
import { Ic, Stars } from "./icons";
import { usePdp } from "./PdpContext";
import { useCart } from "../landing/CartContext";
import { useWishlist } from "../landing/WishlistContext";
import { ensureAuthenticated } from "../../lib/auth-guard";
import { parseINR, type CartItem } from "../../lib/cart-data";

/** Build a cart line item from the current PDP selections. */
function makeItem(
  product: PdpProduct,
  color: PdpColor,
  size: string,
  qty: number
): CartItem {
  return {
    id: `${product.slug}__${color.name}__${size}`,
    slug: product.slug,
    name: product.name,
    type: product.craft,
    color: { name: color.name, hex: color.hex },
    size,
    madeToMeasure: size === "Custom",
    price: parseINR(product.price),
    was: product.was ? parseINR(product.was) : null,
    qty,
    // Cart thumbnail reflects the chosen colour, falling back to the hero shot.
    img: colorImages(product, color)[0] ?? product.images[0],
  };
}

/** Units available for a colour; colours without stock data stay purchasable. */
function stockOf(c: PdpColor): number {
  return c.stock === undefined ? Infinity : c.stock;
}

function AddToBag({
  product,
  color,
  size,
  qty,
  soldOut,
}: {
  product: PdpProduct;
  color: PdpColor;
  size: string;
  qty: number;
  soldOut: boolean;
}) {
  const { addToCart } = usePdp();
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");

  if (soldOut) {
    return (
      <button className="addbtn oos" data-state="idle" disabled>
        <span className="lab l-add">Out of Stock</span>
      </button>
    );
  }

  const onClick = async () => {
    if (state !== "idle") return;
    setState("adding");
    const added = await addToCart(makeItem(product, color, size, qty));
    if (!added) {
      setState("idle");
      return;
    }
    setTimeout(() => {
      setState("added");
      setTimeout(() => setState("idle"), 1900);
    }, 700);
  };

  return (
    <button className="addbtn" data-state={state} onClick={onClick}>
      <span className="lab l-add">
        {Ic.cart} Add to Bag · {product.price}
      </span>
      <span className="lab l-adding">
        <span className="spin" /> Adding…
      </span>
      <span className="lab l-added">{Ic.check} Added to Bag</span>
    </button>
  );
}

function SizeGuide({ chart }: { chart: string[][] }) {
  const heads = ["Size", "Bust (in)", "Waist (in)", "Hip (in)"];
  return (
    <div className="size-guide">
      <table>
        <thead>
          <tr>
            {heads.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chart.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="note">
        Prefer a perfect fit? Choose <b>Custom</b> and our stylist will collect your exact
        measurements after checkout.
      </div>
    </div>
  );
}

function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState(-1);
  return (
    <div className="acc">
      {items.map((it, i) => (
        <div key={it.q} className={`item${open === i ? " open" : ""}`}>
          <button className="q" onClick={() => setOpen(open === i ? -1 : i)}>
            {it.q}
            <span className="ic" />
          </button>
          <div className="a" style={{ maxHeight: open === i ? 240 : 0 }}>
            <div className="inner" dangerouslySetInnerHTML={{ __html: it.a }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BuyBox({
  product,
  color,
  onSelectColor,
}: {
  product: PdpProduct;
  color: PdpColor;
  onSelectColor: (c: PdpColor) => void;
}) {
  const [size, setSize] = useState<string>(
    product.sizes[Math.min(2, product.sizes.length - 1)] ?? product.sizes[0]
  );
  const [qty, setQty] = useState(1);
  const [pop, setPop] = useState(false);
  const [guide, setGuide] = useState(false);
  const { addItem } = useCart();
  const { isWished, toggle } = useWishlist();
  const router = useRouter();
  const wish = isWished(product.slug);

  const available = stockOf(color);
  const soldOut = available <= 0;

  // Keep the chosen quantity purchasable when the colour (and its stock)
  // changes; size is intentionally left untouched across colour switches.
  // Adjusting state during render is React's recommended take on this.
  const [prevColor, setPrevColor] = useState(color);
  if (color !== prevColor) {
    setPrevColor(color);
    setQty((q) => Math.max(1, Math.min(q, stockOf(color))));
  }

  const onWish = () => {
    toggle({
      slug: product.slug,
      name: product.name,
      type: product.craft,
      price: product.price,
      was: product.was ?? null,
      img: product.images[0],
    });
    setPop(true);
    setTimeout(() => setPop(false), 320);
  };

  const buyNow = async () => {
    if (soldOut) return;
    if (!(await ensureAuthenticated("/checkout"))) return;
    addItem(makeItem(product, color, size, qty));
    router.push("/checkout");
  };

  return (
    <div className="bb editorial">
      <span className="eyebrow bb-eye">{product.eyebrow}</span>
      <h1>{product.name}</h1>
      <div className="sub-craft">{product.craft}</div>

      <div className="rate">
        <Stars n={product.rating} />
        <span className="rn">
          <b>{product.rating}</b> / 5
        </span>
        <a href="#reviews">{product.reviewCount} reviews</a>
      </div>

      <div className="priceline">
        <span className="price">{product.price}</span>
        {product.was && <span className="was">{product.was}</span>}
        {product.off && <span className="off">{product.off}</span>}
      </div>
      <div className="tax">Inclusive of all taxes · Hand-finished in our Jaipur atelier</div>

      <p className="desc">{product.desc}</p>

      <div className="grp">
        <div className="grp-head">
          <span className="lab">
            Colour <b>{color.name}</b>
          </span>
        </div>
        <div className="swatches">
          {product.colors.map((c) => (
            <button
              key={c.name}
              className={`sw${c.name === color.name ? " on" : ""}${stockOf(c) <= 0 ? " oos" : ""}`}
              style={{ background: c.hex }}
              title={stockOf(c) <= 0 ? `${c.name} — out of stock` : c.name}
              aria-label={stockOf(c) <= 0 ? `${c.name} (out of stock)` : c.name}
              aria-pressed={c.name === color.name}
              onClick={() => onSelectColor(c)}
            />
          ))}
        </div>
        {soldOut ? (
          <div className="stock-note out">Out of stock in {color.name}</div>
        ) : Number.isFinite(available) && available <= 5 ? (
          <div className="stock-note low">Only {available} left in {color.name}</div>
        ) : null}
      </div>

      <div className="grp">
        <div className="grp-head">
          <span className="lab">Select Size</span>
          <span className="gd" onClick={() => setGuide((g) => !g)}>
            {guide ? "Hide size guide" : "Size guide"}
          </span>
        </div>
        <div className="sizes">
          {product.sizes.map((s) => (
            <button
              key={s}
              className={`size${s === size ? " on" : ""}`}
              onClick={() => setSize(s)}
            >
              {s}
            </button>
          ))}
          <button
            className={`size custom${size === "Custom" ? " on" : ""}`}
            onClick={() => setSize("Custom")}
          >
            Custom
          </button>
        </div>
        {guide && <SizeGuide chart={product.sizeChart} />}
      </div>

      <div className="buy-row">
        <div className="qty">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
            −
          </button>
          <span className="n">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(q + 1, Math.max(1, available)))}
            disabled={qty >= available}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <AddToBag product={product} color={color} size={size} qty={qty} soldOut={soldOut} />
        <button
          className={`wishbtn${wish ? " on" : ""}${pop ? " pop" : ""}`}
          onClick={onWish}
          aria-label={wish ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wish}
        >
          {Ic.heart}
        </button>
      </div>
      <button className="buynow" onClick={buyNow} disabled={soldOut}>
        {soldOut ? "Out of Stock" : "Buy It Now"}
      </button>

      <div className="bb-trust">
        <div className="t">
          {Ic.ship}
          <div className="tt">Free Shipping</div>
          <div className="ts">Insured · Pan-India</div>
        </div>
        <div className="t">
          {Ic.scissor}
          <div className="tt">Made to Measure</div>
          <div className="ts">Stitched to fit</div>
        </div>
        <div className="t">
          {Ic.shield}
          <div className="tt">Secure Checkout</div>
          <div className="ts">UPI · Cards · COD</div>
        </div>
      </div>

      <Accordion items={product.accordion} />
    </div>
  );
}
