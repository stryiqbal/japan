import ScrollSequence from "@/components/effects/scroll-sequence";
import FilmographyShelf from "@/components/sections/filmography-shelf";
import MayaProfileFrame from "@/components/sections/maya-profile-frame";
import ModelCreator from "@/components/sections/model-creator";

type PartnerName = "Tokyo" | "Kyoto" | "Osaka" | "Nara" | "Hokkaido" | "Okinawa";

function PartnerMark({ name }: { name: PartnerName }) {
  const paths: Record<PartnerName, string> = {
    Tokyo: "M3 15c0-7 5-12 14-12-1 9-6 14-13 13l-1 2-2-1z",
    Kyoto: "M10 1l8 4.5v9L10 19l-8-4.5v-9zM10 6l-4 2.3v4.4L10 15l4-2.3V8.3z",
    Osaka: "M1 5q4.5-3 9 0t9 0v3q-4.5 3-9 0t-9 0zm0 7q4.5-3 9 0t9 0v3q-4.5 3-9 0t-9 0z",
    Nara: "M10 1a9 9 0 110 18 9 9 0 010-18zm0 3a6 6 0 100 12 6 6 0 000-12zm0 3a3 3 0 110 6 3 3 0 010-6z",
    Hokkaido: "M1 17L7 6l3 5 3-7 6 13z",
    Okinawa: "M10 1l9 4-9 4-9-4zm-9 8l9 4 9-4v3l-9 4-9-4zm0 5l9 4 9-4v2l-9 4-9-4z",
  };
  const labels: Record<PartnerName, string> = {
    Tokyo: "東京",
    Kyoto: "京都",
    Osaka: "大阪",
    Nara: "奈良",
    Hokkaido: "北海道",
    Okinawa: "沖縄",
  };

  return (
    <span className="logo-item">
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d={paths[name]} /></svg>
      {labels[name]}
    </span>
  );
}

export default function Home() {
  return (
    <>
      <ScrollSequence>
        <nav className="nav" aria-label="メインナビゲーション">
          <a className="brand" href="#home" aria-label="キンドレッドのホーム">
            <svg viewBox="0 0 16 18" aria-hidden="true">
              <path d="M2 0h4v18H2zM7 9c3-1 5-4 6-9h3c-1 5-3 8-6 9 3 1 5 4 6 9h-3c-1-5-3-8-6-9z" />
            </svg>
            <span>キンドレッド</span>
          </a>
          <div className="nav-links">
            <a href="#destinations">旅先</a>
            <a href="#culture">文化</a>
            <a href="#cuisine">食と料理</a>
            <a href="#experiences">体験</a>
            <a href="#travel-tips">旅のヒント</a>
          </div>
          <a className="sign-in" href="#plan">旅を計画する</a>
        </nav>

        <section className="copy" id="home" aria-labelledby="hero-title">
          <h1 id="hero-title"><span>旅に出よう</span><span>四季の日本へ。</span></h1>
          <p>京都の静かな寺院から東京の夜景まで。あなただけの日本を見つけましょう。</p>
          <div className="cta-wrap"><a className="cta" href="#destinations">日本を旅する</a></div>
        </section>

        <div className="logos" aria-label="日本のおすすめ旅先">
          <PartnerMark name="Tokyo" />
          <PartnerMark name="Kyoto" />
          <PartnerMark name="Osaka" />
          <PartnerMark name="Nara" />
          <PartnerMark name="Hokkaido" />
          <PartnerMark name="Okinawa" />
        </div>
      </ScrollSequence>

      <div className="japan-sections">
        <FilmographyShelf />
        <MayaProfileFrame />
      </div>

      <ModelCreator />
    </>
  );
}