import Nav from "../../components/Nav";
import Hero from "../../components/Hero";
import StatStrip from "../../components/StatStrip";
import Section from "../../components/Section";
import Glossary from "../../components/Glossary";
import ReadinessCards from "../../components/ReadinessCards";
import TakePart from "../../components/TakePart";
import Contact from "../../components/Contact";
import Footer from "../../components/Footer";
import Modal from "../../components/Modal";

export default function Home() {
  return (
    <div className="p108 p108-page">
      <Nav />
      <Hero />
      <StatStrip />

      <Section
        id="project"
        eyebrow="The Project"
        headline="A Single Day, <em>108 Chortens</em>, A Lasting Sanctuary."
        variant="plain"
      >
        <p>
          Project 108 is the building of 108 Jangchub Chortens — Stupas of
          Enlightenment — along the sacred Mau River in Gelephu Mindfulness
          City. Each will rise 15 metres into the sky, spaced 108 metres apart
          along a 12-kilometre corridor. The internal structures are being
          prepared throughout 2026; the external structures will all be raised
          together on a single day, 1 November 2026.
        </p>
        <p>
          The initiative is undertaken by the Royal Government of Bhutan as a
          national act of merit, prayer, and collective practice — for the
          benefit of all sentient beings.
        </p>
      </Section>

      <Section
        id="chorten"
        eyebrow="The Chorten"
        headline="Three names for one sacred form."
        variant="cream"
      >
        <Glossary />
      </Section>

      <Section
        id="why-108"
        eyebrow="Why 108"
        headline="A number that <em>recurs</em> across the tradition."
        variant="plain"
      >
        <p>
          108 is a number woven through Buddhist and Vajrayana practice. The
          mala holds 108 beads, one for each turning of the breath in
          meditation. The body is mapped at 108 marma points. King Songtsen
          Gampo is said to have built 108 temples across the Himalayan plateau
          in a single act of devotion.
        </p>
        <p>
          Project 108 takes its place in this lineage — not as repetition, but
          as <em>resonance</em>. One sacred form, given 108 times.
        </p>
      </Section>

      <Section
        id="scale"
        eyebrow="Scale"
        headline="<em>Six Readinesses</em> Already in Motion."
        variant="dark"
      >
        <p style={{ maxWidth: "40rem" }}>
          Preparations are already deeply underway. Here is where things stand.
        </p>
        <ReadinessCards />
      </Section>

      <Section
        id="take-part"
        eyebrow="Take Part"
        headline="<em>Two ways</em> to participate."
        variant="plain"
      >
        <p>
          This is a collective act of merit. Whether you contribute as a patron
          of a chorten or join the build with your hands, you are welcome.
        </p>
        <TakePart />
      </Section>

      <Contact />
      <Footer />
      <Modal />
    </div>
  );
}
