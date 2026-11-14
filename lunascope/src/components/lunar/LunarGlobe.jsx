export default function LunarGlobe() {
  return <div className="lunar-globe-wrap" aria-label="Illustration of the lunar south pole">
    <div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="moon-shadow"/><div className="moon">
      <span className="crater crater-a"/><span className="crater crater-b"/><span className="crater crater-c"/><span className="crater crater-d"/><span className="crater crater-e"/><span className="crater crater-f"/><span className="crater crater-g"/><span className="terrain-sweep"/>
    </div>
    <div className="moonlet moonlet-left"/><div className="moonlet moonlet-right"/><div className="horizon-glow"/>
  </div>;
}
