import { Outlet } from "react-router-dom";
import { useHyttynen } from "../context/HyttynenProvider";
import { useEffect } from "react";

// Status dot component
function StatusDot({ connectionStatus }) {
  return <span className={`status-dot ${connectionStatus}`} />;
}

const Layout = () => {
    const { connectionState, openHyttynen, closeHyttynen } = useHyttynen();
    useEffect(() => {
        console.log('[Layout::useEffect] invoked');
        openHyttynen();
        return () => {
            console.log('[Layout::useEffect.clean up function, closing connection');
            closeHyttynen();
        }
    }, []);

    // Returning layout
    return (<div className="app">
            <header className="header">
                <div className="header-left">
                    <h1>Hyttynen</h1>
                </div>
                <div className="header-right">
                    <StatusDot connectionStatus={connectionState()} />
                    <span className="conn-label">{connectionState()}</span>
                </div>
            </header>
            <Outlet />
        </div>
    );
}
export default Layout;