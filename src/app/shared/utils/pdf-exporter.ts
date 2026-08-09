import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Converts an oklch(...) color string into an rgb(...) color string
 * using the browser's native CSS engine.
 */
function convertOklchToRgb(oklchStr: string): string {
  try {
    if (typeof document === 'undefined' || !document.body) {
      return 'rgb(0, 123, 189)';
    }
    const temp = document.createElement('div');
    temp.style.color = oklchStr;
    document.body.appendChild(temp);
    const computed = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    if (computed && computed !== '' && !computed.includes('oklch')) {
      return computed;
    }
  } catch {
    // Fallback if native parsing fails
  }
  return 'rgb(0, 123, 189)';
}

/**
 * Helper to convert an image element to a Base64 data URL for SVG rendering safety.
 */
async function imageToDataUrl(imgEl: HTMLImageElement): Promise<string> {
  return new Promise((resolve) => {
    if (!imgEl.src || imgEl.src.startsWith('data:')) {
      resolve(imgEl.src || '');
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 100;
        canvas.height = img.naturalHeight || img.height || 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
          return;
        }
      } catch {
        // Canvas CORS restriction fallback
      }
      resolve(imgEl.src);
    };
    img.onerror = () => resolve(imgEl.src);
    img.src = imgEl.src;
  });
}

/**
 * Recursively sanitizes CSS rules (including CSSGroupingRule, CSSLayerBlockRule, @supports, @media)
 * replacing any oklch color functions with standard RGB colors.
 */
function sanitizeRule(rule: CSSRule, oklchRegex: RegExp) {
  // Handle rules with nested cssRules (e.g., CSSLayerBlockRule, CSSGroupingRule, CSSMediaRule, CSSSupportsRule)
  if ('cssRules' in rule && (rule as CSSGroupingRule).cssRules) {
    try {
      const subRules = Array.from((rule as CSSGroupingRule).cssRules);
      subRules.forEach((subRule) => sanitizeRule(subRule, oklchRegex));
    } catch {
      // Cross-origin or unaccessible sub-rules ignored
    }
  }

  // Handle CSSStyleRule
  const styleRule = rule as CSSStyleRule;
  if (styleRule && styleRule.style) {
    const style = styleRule.style;
    const cssText = style.cssText || '';
    if (cssText.includes('oklch')) {
      for (let i = style.length - 1; i >= 0; i--) {
        const prop = style[i];
        const val = style.getPropertyValue(prop);
        if (val && val.includes('oklch')) {
          const sanitizedVal = val.replace(oklchRegex, (match) => convertOklchToRgb(match));
          style.setProperty(prop, sanitizedVal);
        }
      }
    }
  }
}

/**
 * Pre-sanitizes document <style> elements, document.styleSheets (including @layer theme),
 * and inline styles to replace modern oklch(...) colors with standard rgb(...) BEFORE html2canvas parses them.
 */
function sanitizeDocumentOklchColors(doc: Document = document, element?: HTMLElement) {
  const oklchRegex = /oklch\([^)]+\)/gi;

  // 1. Sanitize all <style> tags
  try {
    const styleEls = Array.from(doc.querySelectorAll('style'));
    styleEls.forEach((styleEl) => {
      if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
        styleEl.textContent = styleEl.textContent.replace(oklchRegex, (match) =>
          convertOklchToRgb(match)
        );
      }
    });
  } catch {
    // Ignore error
  }

  // 2. Sanitize active document.styleSheets recursively (handles @layer theme, @supports, etc.)
  try {
    Array.from(doc.styleSheets).forEach((sheet) => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        rules.forEach((rule) => sanitizeRule(rule, oklchRegex));
      } catch {
        // Cross-domain stylesheets can be skipped
      }
    });
  } catch {
    // Ignore cross-origin error
  }

  // 3. Sanitize inline style attributes on element & descendants
  if (element) {
    try {
      const nodes = [element, ...Array.from(element.querySelectorAll('*'))];
      nodes.forEach((node) => {
        const htmlNode = node as HTMLElement;
        const styleAttr = htmlNode.getAttribute?.('style') || '';
        if (styleAttr.includes('oklch')) {
          htmlNode.setAttribute('style', styleAttr.replace(oklchRegex, (m) => convertOklchToRgb(m)));
        }
      });
    } catch {
      // Ignore error
    }
  }
}

/**
 * Fallback renderer using browser native SVG foreignObject canvas rendering.
 * Runs if html2canvas fails for any reason.
 */
async function renderCanvasViaSVG(element: HTMLElement): Promise<HTMLCanvasElement> {
  const width = element.offsetWidth || 750;
  const height = element.offsetHeight || 1000;

  const clone = element.cloneNode(true) as HTMLElement;
  const origElements = [element, ...Array.from(element.querySelectorAll('*'))];
  const cloneElements = [clone, ...Array.from(clone.querySelectorAll('*'))];

  const oklchRegex = /oklch\([^)]+\)/gi;
  const cleanColor = (val: string) => {
    if (!val) return val;
    if (val.includes('oklch')) {
      return val.replace(oklchRegex, (m) => convertOklchToRgb(m));
    }
    return val;
  };

  const imgPromises: Promise<void>[] = [];

  origElements.forEach((orig, idx) => {
    const target = cloneElements[idx] as HTMLElement;
    if (target && target.style) {
      const computed = window.getComputedStyle(orig as HTMLElement);
      target.style.color = cleanColor(computed.color);
      target.style.backgroundColor = cleanColor(computed.backgroundColor);
      target.style.borderColor = cleanColor(computed.borderColor);
      target.style.fontFamily = computed.fontFamily;
      target.style.fontSize = computed.fontSize;
      target.style.fontWeight = computed.fontWeight;
      target.style.padding = computed.padding;
      target.style.margin = computed.margin;
      target.style.border = computed.border;
      target.style.borderRadius = computed.borderRadius;
      target.style.boxSizing = computed.boxSizing;
      target.style.display = computed.display;
      target.style.flexDirection = computed.flexDirection;
      target.style.alignItems = computed.alignItems;
      target.style.justifyContent = computed.justifyContent;
      target.style.gap = computed.gap;

      if (orig instanceof HTMLImageElement && target instanceof HTMLImageElement) {
        imgPromises.push(
          imageToDataUrl(orig).then((dataUrl) => {
            target.src = dataUrl;
          })
        );
      }
    }
  });

  await Promise.all(imgPromises);

  const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="background: #ffffff; padding: 10px; width: 100%; height: 100%; box-sizing: border-box;">
          ${clone.outerHTML}
        </div>
      </foreignObject>
    </svg>
  `;

  const img = new Image();
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);
      }
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Captures a report element and exports it as a high-quality A4 PDF document.
 */
export async function exportReportToPdf(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[PdfExporter] Target element '#${elementId}' not found in DOM.`);
    alert('لم يتم العثور على محتوى التقرير للتحميل.');
    return;
  }

  let canvas: HTMLCanvasElement | null = null;

  try {
    canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      scrollX: 0,
      scrollY: -window.scrollY,
      onclone: (clonedDoc, clonedElement) => {
        sanitizeDocumentOklchColors(clonedDoc, clonedElement);
      },
    });
  } catch (canvasErr) {
    console.warn('[PdfExporter] html2canvas failed, attempting native SVG renderer fallback...', canvasErr);
    try {
      canvas = await renderCanvasViaSVG(element);
    } catch (fallbackErr) {
      console.error('[PdfExporter] Fallback renderer also failed:', fallbackErr);
    }
  }

  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    alert('تعذر إنشاء صورة التقرير للتحميل.');
    return;
  }

  try {
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const marginX = 8; // 8mm left & right margins
    const marginY = 8; // 8mm top & bottom margins
    const printWidth = pdfWidth - marginX * 2; // 194mm
    const printHeight = (canvas.height * printWidth) / canvas.width;

    if (printHeight <= pdfHeight - marginY * 2) {
      // Single page PDF
      pdf.addImage(imgData, 'PNG', marginX, marginY, printWidth, printHeight);
    } else {
      // Multi-page PDF
      let heightLeft = printHeight;
      let position = marginY;

      pdf.addImage(imgData, 'PNG', marginX, position, printWidth, printHeight);
      heightLeft -= pdfHeight - marginY * 2;

      while (heightLeft > 0) {
        position = heightLeft - printHeight + marginY;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', marginX, position, printWidth, printHeight);
        heightLeft -= pdfHeight - marginY * 2;
      }
    }

    pdf.save(filename);
  } catch (err: any) {
    console.error('[PdfExporter] Error saving PDF:', err);
    alert(`تعذر حفظ ملف الـ PDF: ${err?.message || 'خطأ أثناء الحفظ'}`);
  }
}

