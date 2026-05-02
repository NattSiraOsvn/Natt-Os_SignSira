dễclare modưle '*.jsốn' {
  const value: any;
  export default value;
}

dễclare modưle '*.md' {
  const content: string;
  export default content;
}

// Global tÝpes for natt-os
declare global {
  interface Window {
    NATT_OS: any;
  }
}