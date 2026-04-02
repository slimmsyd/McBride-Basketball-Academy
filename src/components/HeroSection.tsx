import Image from "next/image";

const heroImages = [
  { src: "/assets/hero-1.jpg", alt: "Issac McBride - March Madness tunnel walk" },
  { src: "/assets/hero-2.jpg", alt: "Issac McBride - #10 jersey portrait with basketball" },
  { src: "/assets/hero-3.jpg", alt: "Issac McBride - Oral Roberts seated with basketball" },
  { src: "/assets/hero-4.webp", alt: "Issac McBride - National Player of the Week" },
];

const mobileHeroImage = {
  src: "/assets/hero-mobile.webp",
  alt: "Issac McBride - Oscar Robertson National Player of the Week",
};

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-white">
      {/* Mobile hero image */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src={mobileHeroImage.src}
          alt={mobileHeroImage.alt}
          fill
          className="object-cover"
          priority
        />
      </div>
      {/* Desktop 4-column gallery */}
      <div className="absolute inset-0 hidden md:grid md:grid-cols-4 gap-0">
        {heroImages.map((img) => (
          <div key={img.src} className="relative overflow-hidden">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              priority
            />
          </div>
        ))}
      </div>
      {/* Bottom gradient for text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 45%, rgba(255,255,255,0.7) 70%, white 90%)",
        }}
      />
      {/* Hero text */}
      <div className="absolute bottom-16 md:bottom-24 left-6 md:left-20 z-10">
        <h1 className="font-[family-name:var(--font-headline)] text-5xl md:text-[80px] font-extrabold text-primary leading-[0.95] tracking-wide">
          ISSAC McBRIDE
        </h1>
        <p className="font-[family-name:var(--font-body)] text-lg md:text-2xl font-semibold text-secondary tracking-[4px] mt-3">
          McBride Basketball Academy
        </p>
        <a
          href="#booking"
          className="inline-block mt-6 md:mt-8 bg-accent text-white font-[family-name:var(--font-headline)] text-base md:text-lg font-bold tracking-wide px-8 md:px-10 py-3 md:py-4 rounded-lg hover:bg-accent/90 transition-colors"
        >
          BOOK YOUR SESSION
        </a>
      </div>
    </section>
  );
}
