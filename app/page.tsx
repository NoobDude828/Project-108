"use client";

import Script from "next/script";
import "./scroll.css";

import StatusBar from "@/components/ui/StatusBar";
import FormModal from "@/components/ui/FormModal";
import FloatTopButton from "@/components/ui/FloatTopButton";

import SceneTitle from "@/components/scenes/SceneTitle";
import SceneWhat from "@/components/scenes/SceneWhat";
import SceneAssembly from "@/components/scenes/SceneAssembly";
import SceneScale from "@/components/scenes/SceneScale";
import SceneWhy from "@/components/scenes/SceneWhy";
import SceneMultiply from "@/components/scenes/SceneMultiply";
import SceneSpacing from "@/components/scenes/SceneSpacing";
import SceneRiver from "@/components/scenes/SceneRiver";
import SceneStack from "@/components/scenes/SceneStack";
import SceneTime from "@/components/scenes/SceneTime";
import SceneManpower from "@/components/scenes/SceneManpower";
import SceneVolunteers from "@/components/scenes/SceneVolunteers";
import SceneCompletion from "@/components/scenes/SceneCompletion";
import SceneInvitation from "@/components/scenes/SceneInvitation";
import SceneGesture from "@/components/scenes/SceneGesture";

export default function ScrollPage() {
  return (
    <>
      <StatusBar />

      <div className="rail" aria-hidden="true">
        <div className="rail__fill"></div>
      </div>

      <SceneTitle />
      <SceneWhat />
      <SceneAssembly />
      <SceneScale />
      <SceneWhy />
      <SceneMultiply />
      <SceneSpacing />
      <SceneRiver />
      <SceneStack />
      <SceneTime />
      <SceneManpower />
      <SceneVolunteers />
      <SceneCompletion />
      <SceneInvitation />
      <SceneGesture />

      <FloatTopButton />
      <FormModal />

      <Script
        src="/scroll/scrollytelling.js?v=21"
        strategy="afterInteractive"
      />
      <Script src="/scroll/form.js" strategy="afterInteractive" />
    </>
  );
}
