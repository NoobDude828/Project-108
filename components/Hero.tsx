import Image from "next/image";

export default function Hero() {
  return (
    <header id="top" className="p108-hero">
      <div className="p108-hero__inner">
        <div>
          <div className="p108-hero__eyebrow">Project</div>
          <div className="p108-hero__numeral">108</div>
          <p className="p108-hero__caption">
            108 Jangchub Chortens, each 15 metres tall, completed together in a
            single day.
          </p>
        </div>
        <div className="p108-hero__chorten">
          <Image
            src="/assets/hero_chorten.svg"
            alt="Jangchub Chorten"
            width={280}
            height={485}
            priority
          />
        </div>
      </div>
    </header>
  );
}
