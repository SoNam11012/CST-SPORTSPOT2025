declare module 'bootstrap/dist/js/bootstrap.bundle.min.js' {
  export const Modal: {
    getInstance: (element: HTMLElement) => {
      hide: () => void;
    } | null;
  };
}

// Global bootstrap type declaration
interface Window {
  bootstrap: {
    Modal: {
      getInstance: (element: HTMLElement) => {
        hide: () => void;
      } | null;
    };
  };
} 