import React from 'react';
// Assuming MyDropzone is a component you have created or imported
import DropZone from './FileDropBox.jsx';
import './Commercial.css'

function App() {
  return (
    <div className="h-screen w-full flex flex-col text-black">
      {/* Top Navigation Bar */}
      <nav className="bg-purple-900 shadow">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end h-16 ">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                {/* Navigation Item: Pricing */}
                <a href="#" className="text-lg text-purple-100 font-medium font-dm">Pricing</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="bg-purple-100 flex-grow flex flex-col items-center justify-center p-4">
        <h1 className="text-center text-blue font-bold text-4xl mb-4 font-raleway">
          Secure PDF Compressor
        </h1>
        <p className="max-w-xl text-center text-lg mb-6 font-sans ">
          This PDF compressor works right in your browser using the latest web technologies, meaning it does not rely on external servers.
          <br/><b>We do not send your files anywhere</b>, so we cannot leak data we never had.<br/><b>Safe, fast, and private</b> - all without leaving your browser.
        </p>
        <div className="w-full max-w-md">
          <DropZone />
        </div>
      </main>

      <footer className="bg-white w-full flex items-center justify-center	">
        <div className=" py-4 text-center  flex space-x-4">
          <a href="#" className="hover:underline text-black font-dm" rel="noopener noreferrer">Legal Mentions</a>
          <a href="https://github.com/laurentmmeyer/ghostscript-pdf-compress.wasm" target={"_blank"} className="hover:underline text-black font-dm" rel="noopener noreferrer">Source Code</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
