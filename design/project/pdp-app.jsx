/* ============================================================
   AV Creation — Product Page · layouts + design canvas mount
   ============================================================ */

/* ---- HERO VARIATION 1 · Atelier Classic (left rail + arch) ---- */
function HeroClassic() {
  return (
    <PageShell navHot="Lehenga">
      <Crumb />
      <div className="ptop classic">
        <GalleryClassic images={PRODUCT.images} flag="Bridal · Made to Order" arch />
        <BuyBox variant="classic" showAccordion />
      </div>
    </PageShell>
  );
}

/* ---- HERO VARIATION 2 · Editorial Stack (thumbs below) ---- */
function HeroEditorial() {
  return (
    <PageShell navHot="Lehenga">
      <Crumb />
      <div className="ptop editorial">
        <GalleryEditorial images={PRODUCT.images} flag="Bridal · Made to Order" />
        <BuyBox variant="editorial" showAccordion />
      </div>
    </PageShell>
  );
}

/* ---- HERO VARIATION 3 · Boutique Gallery (mosaic + panel) ---- */
function HeroBoutique() {
  return (
    <PageShell navHot="Lehenga">
      <Crumb />
      <div className="ptop boutique">
        <GalleryBoutique images={PRODUCT.images} flag="Bridal · Made to Order" />
        <BuyBox variant="boutique" panel showAccordion />
      </div>
    </PageShell>
  );
}

/* ---- FULL ASSEMBLED PAGE (Atelier Classic + all sections) ---- */
function FullPage() {
  return (
    <PageShell navHot="Lehenga">
      <Crumb />
      <div className="ptop classic">
        <GalleryClassic images={PRODUCT.images} flag="Bridal · Made to Order" arch />
        <BuyBox variant="classic" showAccordion />
      </div>
      <CraftBand />
      <ReviewsSection />
      <ShopTheLook />
      <Related />
      <SlimFooter />
    </PageShell>
  );
}

/* ---- CANVAS ---- */
function App() {
  return (
    <DesignCanvas>
      <DCSection id="hero" title="Product hero — 3 directions" subtitle="Same bridal piece, three buy-box & gallery layouts · hover the image to zoom · try Add to Bag">
        <DCArtboard id="classic" label="A · Atelier Classic" width={1200} height={1190}><HeroClassic /></DCArtboard>
        <DCArtboard id="editorial" label="B · Editorial Stack" width={1200} height={1240}><HeroEditorial /></DCArtboard>
        <DCArtboard id="boutique" label="C · Boutique Gallery" width={1200} height={1385}><HeroBoutique /></DCArtboard>
      </DCSection>
      <DCSection id="full" title="Full page — assembled" subtitle="The complete product page using direction A, with every section">
        <DCArtboard id="page" label="Product detail page" width={1200} height={4480}><FullPage /></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
