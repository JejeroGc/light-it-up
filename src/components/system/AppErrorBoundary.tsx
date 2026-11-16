import React from "react";

type State = { error: Error | null };
export default class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error("[Light It Up] Editor crash", error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return <div style={{padding:24,color:"#fff",background:"#111318",height:"100vh",fontFamily:"system-ui"}}>
      <h2 style={{color:"#ff63d8"}}>Light It Up encontró un error al abrir el venue</h2>
      <p>El escenario no fue borrado. Copiá este mensaje para poder corregir el componente exacto:</p>
      <pre style={{whiteSpace:"pre-wrap",padding:16,border:"1px solid #444",borderRadius:8,background:"#181a20"}}>{this.state.error.message}{"\n"}{this.state.error.stack}</pre>
      <button onClick={() => this.setState({error:null})}>Reintentar editor</button>
    </div>;
  }
}
