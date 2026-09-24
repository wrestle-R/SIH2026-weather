"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="fatal-state"><span>[ PIPELINE ERROR ]</span><h1>THE VIEW COULD NOT BE RENDERED.</h1><p>No evidence was altered. Retry the local operation.</p><button className="button primary" onClick={reset}>RETRY VIEW</button></div>;
}
