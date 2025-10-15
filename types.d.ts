interface ShellResponse {
  type: "shell" | "code";
  data: any;
}

interface CodeFile {
  filename: string;
  content: string;
}
