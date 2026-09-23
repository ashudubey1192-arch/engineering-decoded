// A whitespace-only formatter for the small authored teaching programs. It
// preserves quoted literals and for-loop headers. Compilation verifies output.
export function formatJava(source) {
  const lines=[];let line="",indent=0,paren=0,quote=null,escaped=false;
  const flush=()=>{if(line.trim())lines.push("  ".repeat(Math.max(0,indent))+line.trim());line="";};
  for(let i=0;i<source.length;i++){
    const ch=source[i];
    if(quote){line+=ch;if(escaped)escaped=false;else if(ch==="\\")escaped=true;else if(ch===quote)quote=null;continue;}
    if(ch==='"'||ch==="'"){quote=ch;line+=ch;continue;}
    if(ch==="(")paren++;
    if(ch===")")paren--;
    if(ch==="{"&&paren===0){line+=(line&&!line.endsWith(" ")?" ":"")+ch;flush();indent++;}
    else if(ch==="}"&&paren===0){flush();indent--;line="}";if(!/[;,)]/.test(source.slice(i+1).trimStart()[0]||""))flush();}
    else if(ch===";"&&paren===0){line+=ch;flush();}
    else if(ch==="\n"||ch==="\r"){if(line&&!line.endsWith(" "))line+=" ";}
    else line+=ch;
  }
  flush();return lines.join("\n")+"\n";
}
