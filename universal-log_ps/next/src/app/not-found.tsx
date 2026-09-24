import Link from "next/link";

export default function NotFound() {
  return <div className="fatal-state"><span>[ 404 / ROUTE ABSENT ]</span><h1>NO MODULE AT THIS ADDRESS.</h1><p>The requested command-center route is not registered.</p><Link className="button primary" href="/">RETURN TO COMMAND</Link></div>;
}
