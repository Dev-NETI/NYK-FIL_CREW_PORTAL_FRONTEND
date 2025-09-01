"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface Annotation {
  id: string;
  type: 'text' | 'highlight' | 'signature';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content: string;
  color: string;
  fontSize?: number;
  page: number;
}

interface BrowserPDFEditorProps {
  pdfUrl?: string;
  pdfData?: ArrayBuffer;
  initialAnnotations?: Annotation[];
  isReadOnly?: boolean;
  onSave?: (pdfBytes: ArrayBuffer, annotations: Annotation[]) => void;
  onAnnotationsChange?: (annotations: Annotation[]) => void;
  showSignatureArea?: boolean;
  signatureAdded?: boolean;
  onSignatureToggle?: () => void;
  className?: string;
}

export default function BrowserPDFEditor({
  pdfUrl,
  pdfData,
  initialAnnotations = [],
  isReadOnly = false,
  onSave,
  onAnnotationsChange,
  showSignatureArea = false,
  signatureAdded = false,
  onSignatureToggle,
  className = ""
}: BrowserPDFEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'highlight' | 'signature'>('select');
  // const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load PDF document
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        let arrayBuffer: ArrayBuffer;

        if (pdfData) {
          arrayBuffer = pdfData;
        } else if (pdfUrl) {
          const response = await fetch(pdfUrl);
          arrayBuffer = await response.arrayBuffer();
        } else {
          throw new Error('No PDF data or URL provided');
        }

        const pdf = await PDFDocument.load(arrayBuffer);
        setPdfDoc(pdf);
        setTotalPages(pdf.getPageCount());
        setError(null);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF document');
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [pdfUrl, pdfData]);

  // Render current page
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Get page
      const page = pdfDoc.getPage(currentPage - 1);
      const { width, height } = page.getSize();

      // Set canvas size
      canvas.width = width * scale;
      canvas.height = height * scale;
      canvas.style.width = `${width * scale}px`;
      canvas.style.height = `${height * scale}px`;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render page annotations from current page
      const pageAnnotations = annotations.filter(ann => ann.page === currentPage);
      
      pageAnnotations.forEach(annotation => {
        ctx.save();
        
        switch (annotation.type) {
          case 'text':
            ctx.fillStyle = annotation.color;
            ctx.font = `${(annotation.fontSize || 14) * scale}px Arial`;
            ctx.fillText(
              annotation.content,
              annotation.x * scale,
              annotation.y * scale
            );
            break;
            
          case 'highlight':
            ctx.fillStyle = annotation.color;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(
              annotation.x * scale,
              annotation.y * scale,
              (annotation.width || 100) * scale,
              (annotation.height || 20) * scale
            );
            break;
            
          case 'signature':
            ctx.fillStyle = annotation.color;
            ctx.font = `${(annotation.fontSize || 16) * scale}px cursive`;
            ctx.fillText(
              annotation.content,
              annotation.x * scale,
              annotation.y * scale
            );
            break;
        }
        
        ctx.restore();
      });

    } catch (err) {
      console.error('Error rendering page:', err);
    }
  }, [pdfDoc, currentPage, scale, annotations]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Handle canvas click for adding annotations
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isReadOnly || selectedTool === 'select') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: selectedTool,
      x,
      y,
      page: currentPage,
      content: '',
      color: selectedTool === 'highlight' ? '#ffff00' : '#000000',
      fontSize: selectedTool === 'signature' ? 16 : 14
    };

    if (selectedTool === 'text') {
      const content = prompt('Enter text:');
      if (!content) return;
      newAnnotation.content = content;
    } else if (selectedTool === 'highlight') {
      newAnnotation.width = 100;
      newAnnotation.height = 20;
      newAnnotation.content = 'Highlight';
    } else if (selectedTool === 'signature') {
      const content = prompt('Enter signature text:');
      if (!content) return;
      newAnnotation.content = content;
      newAnnotation.color = '#0066cc';
    }

    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);
    onAnnotationsChange?.(updatedAnnotations);
  };

  // Handle page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle zoom
  const handleZoom = (newScale: number) => {
    setScale(Math.max(0.5, Math.min(3, newScale)));
  };

  // Save PDF with annotations
  const handleSave = async () => {
    if (!pdfDoc || !onSave) return;

    try {
      // Create a copy of the PDF
      const pdfBytes = await pdfDoc.save();
      const newPdf = await PDFDocument.load(pdfBytes);

      // Add annotations to PDF
      const font = await newPdf.embedFont(StandardFonts.Helvetica);
      
      for (const annotation of annotations) {
        const page = newPdf.getPage(annotation.page - 1);
        const { height } = page.getSize();
        
        switch (annotation.type) {
          case 'text':
            page.drawText(annotation.content, {
              x: annotation.x,
              y: height - annotation.y,
              size: annotation.fontSize || 14,
              font,
              color: rgb(0, 0, 0)
            });
            break;
            
          case 'signature':
            page.drawText(annotation.content, {
              x: annotation.x,
              y: height - annotation.y,
              size: annotation.fontSize || 16,
              font,
              color: rgb(0, 0.4, 0.8)
            });
            break;
        }
      }

      const finalPdfBytes = await newPdf.save();
      const arrayBuffer = finalPdfBytes.buffer.slice(finalPdfBytes.byteOffset, finalPdfBytes.byteOffset + finalPdfBytes.byteLength) as ArrayBuffer;
      onSave(arrayBuffer, annotations);
    } catch (err) {
      console.error('Error saving PDF:', err);
      alert('Failed to save PDF');
    }
  };

  // Delete annotation
  const deleteAnnotation = (id: string) => {
    const updatedAnnotations = annotations.filter(ann => ann.id !== id);
    setAnnotations(updatedAnnotations);
    onAnnotationsChange?.(updatedAnnotations);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading PDF...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Toolbar */}
      {!isReadOnly && (
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Tools */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Tools:</span>
              <button
                onClick={() => setSelectedTool('select')}
                className={`px-3 py-1 text-sm rounded ${
                  selectedTool === 'select'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className="bi bi-cursor mr-1"></i>
                Select
              </button>
              <button
                onClick={() => setSelectedTool('text')}
                className={`px-3 py-1 text-sm rounded ${
                  selectedTool === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className="bi bi-fonts mr-1"></i>
                Text
              </button>
              <button
                onClick={() => setSelectedTool('highlight')}
                className={`px-3 py-1 text-sm rounded ${
                  selectedTool === 'highlight'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className="bi bi-highlighter mr-1"></i>
                Highlight
              </button>
              <button
                onClick={() => setSelectedTool('signature')}
                className={`px-3 py-1 text-sm rounded ${
                  selectedTool === 'signature'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className="bi bi-pen mr-1"></i>
                Signature
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Zoom:</span>
              <button
                onClick={() => handleZoom(scale - 0.1)}
                className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                <i className="bi bi-zoom-out"></i>
              </button>
              <span className="text-sm text-gray-600 min-w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => handleZoom(scale + 0.1)}
                className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                <i className="bi bi-zoom-in"></i>
              </button>
            </div>

            {/* Save Button */}
            {onSave && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                <i className="bi bi-save mr-1"></i>
                Save PDF
              </button>
            )}
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      <div className="relative">
        <div
          ref={containerRef}
          className="overflow-auto max-h-screen p-4 bg-gray-50"
          style={{ maxHeight: '70vh' }}
        >
          <div className="flex justify-center">
            <div className="bg-white shadow-lg">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`border ${selectedTool !== 'select' && !isReadOnly ? 'cursor-crosshair' : 'cursor-default'}`}
              />
            </div>
          </div>
        </div>

        {/* Page Navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-3">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1 text-gray-600 hover:text-blue-600 disabled:text-gray-300"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          
          <span className="text-sm text-gray-700 min-w-20 text-center">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1 text-gray-600 hover:text-blue-600 disabled:text-gray-300"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Annotations Panel */}
      {annotations.length > 0 && !isReadOnly && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Annotations ({annotations.length})
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {annotations.map((annotation) => (
              <div
                key={annotation.id}
                className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="capitalize text-gray-600">
                    {annotation.type}:
                  </span>
                  <span className="text-gray-800">
                    {annotation.content || 'No content'}
                  </span>
                  <span className="text-xs text-gray-500">
                    (Page {annotation.page})
                  </span>
                </div>
                <button
                  onClick={() => deleteAnnotation(annotation.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <i className="bi bi-trash text-xs"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signature Area */}
      {showSignatureArea && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Digital Signature:
              </span>
              <span className={`text-sm px-2 py-1 rounded ${
                signatureAdded 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {signatureAdded ? 'Signed' : 'Pending Signature'}
              </span>
            </div>
            {onSignatureToggle && (
              <button
                onClick={onSignatureToggle}
                className={`px-4 py-2 text-sm rounded ${
                  signatureAdded
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {signatureAdded ? 'Remove Signature' : 'Add Signature'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}