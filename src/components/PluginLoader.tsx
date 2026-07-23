import React, { useEffect, useState, useRef } from 'react';

interface PluginLoaderProps {
  moduleUrl: string;
  onClose: () => void;
  appProps?: any;
}

const PluginLoader: React.FC<PluginLoaderProps> = ({ moduleUrl, onClose, appProps }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let styleLink: HTMLLinkElement | null = null;

    const loadPlugin = async () => {
      try {
        setLoading(true);
        // Load CSS if exists
        const cssUrl = moduleUrl.replace('plugin.js', 'style.css');
        try {
          const cssRes = await fetch(cssUrl);
          if (cssRes.ok) {
            styleLink = document.createElement('link');
            styleLink.rel = 'stylesheet';
            styleLink.href = cssUrl;
            document.head.appendChild(styleLink);
          }
        } catch (e) {
          // CSS is optional
        }

        // Fetch the plugin code from the custom protocol
        const response = await fetch(moduleUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch plugin: ${response.statusText}`);
        }
        
        const code = await response.text();
        
        // Create a new script element to evaluate the code
        // The code should be a UMD module or an IIFE that attaches itself to window.RitaPlugin
        const script = document.createElement('script');
        script.textContent = `
          (function() {
            try {
              ${code}
            } catch(e) {
              console.error('Error executing plugin code:', e);
              window.__RitaPluginError = e.message;
            }
          })();
        `;
        document.body.appendChild(script);

        if ((window as any).__RitaPluginError) {
          throw new Error((window as any).__RitaPluginError);
        }

        // The plugin must expose a 'mount' function on window.RitaPlugin
        const plugin = (window as any).RitaPlugin;
        if (!plugin || typeof plugin.mount !== 'function') {
          throw new Error("Plugin did not expose a valid 'mount' function on window.RitaPlugin");
        }

        // Mount the plugin into our container
        if (containerRef.current && isMounted) {
          plugin.mount(containerRef.current, {
            onClose,
            api: (window as any).api,
            appProps: appProps
          });
        }
        
      } catch (err: any) {
        console.error("Plugin loading error:", err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPlugin();

    return () => {
      isMounted = false;
      if (styleLink && styleLink.parentNode) {
        styleLink.parentNode.removeChild(styleLink);
      }
      try {
        const plugin = (window as any).RitaPlugin;
        if (plugin && typeof plugin.unmount === 'function') {
          plugin.unmount(containerRef.current);
        }
      } catch (e) {
        console.error('Error unmounting plugin:', e);
      }
      // Clear global object to avoid pollution between plugins
      (window as any).RitaPlugin = undefined;
      (window as any).__RitaPluginError = undefined;
    };
  }, [moduleUrl]);

  if (error) {
    return (
      <div style={{ padding: 20, color: 'red', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <h2>Error Loading Plugin</h2>
        <p>{error}</p>
        <button onClick={onClose} style={{ marginTop: 20, padding: '10px 20px', cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)', zIndex: 10 }}>
          <h2>Loading Module...</h2>
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default PluginLoader;
