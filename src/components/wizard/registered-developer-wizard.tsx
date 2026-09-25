import * as React from "react";
import { X, Menu, Minus, Plus, Download, Printer, MoreVertical, RotateCw, Undo, Redo, Maximize, Edit3 } from "lucide-react";

interface RegisteredDeveloperWizardProps {
  onClose: () => void;
  type?: "developer" | "tpa" | "ltp";
}

export function RegisteredDeveloperWizard({ onClose, type = "developer" }: RegisteredDeveloperWizardProps) {
  const isTpa = type === "tpa";
  const isLtp = type === "ltp";
  const pages = isTpa ? "3" : isLtp ? "25" : "19";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full h-full md:w-[95vw] md:h-[95vh] bg-[#525659] shadow-2xl flex flex-col overflow-hidden rounded-md">
        
        {/* PDF Viewer Toolbar */}
        <div className="h-12 bg-[#323639] flex items-center justify-between px-4 text-white shrink-0 border-b border-black/20 shadow-sm relative z-10">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Menu className="size-5 text-gray-200" />
            </button>
            <span className="font-medium text-gray-200 text-sm">Report.ArCacheItem</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded">
              <span className="text-sm">1 / {pages}</span>
            </div>
            
            <div className="w-[1px] h-6 bg-white/20 mx-2" />
            
            <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <Minus className="size-4" />
            </button>
            <span className="text-sm font-medium w-12 text-center">79%</span>
            <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <Plus className="size-4" />
            </button>

            <div className="w-[1px] h-6 bg-white/20 mx-2" />
            
            <div className="flex items-center gap-1 hidden md:flex">
              <button className="p-1.5 hover:bg-white/10 rounded transition-colors"><Maximize className="size-4" /></button>
              <button className="p-1.5 hover:bg-white/10 rounded transition-colors"><RotateCw className="size-4" /></button>
              <button className="p-1.5 hover:bg-white/10 rounded transition-colors"><Edit3 className="size-4" /></button>
              <button className="p-1.5 hover:bg-white/10 rounded transition-colors opacity-50"><Undo className="size-4" /></button>
              <button className="p-1.5 hover:bg-white/10 rounded transition-colors opacity-50"><Redo className="size-4" /></button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <Download className="size-5" />
            </button>
            <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <Printer className="size-5" />
            </button>
            <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <MoreVertical className="size-5" />
            </button>
            <div className="w-[1px] h-6 bg-white/20 mx-1" />
            <button onClick={onClose} className="p-1.5 hover:bg-red-500 rounded-full transition-colors">
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* PDF Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Thumbnails Sidebar */}
          <div className="w-56 bg-[#323639] border-r border-black/20 flex flex-col overflow-y-auto hidden md:flex py-4 scrollbar-thin scrollbar-thumb-white/20">
            {[1, 2, 3].map((page) => (
              <div key={page} className="flex flex-col items-center gap-2 mb-6">
                <div className={`w-32 h-44 bg-white shadow-md flex items-center justify-center text-xs text-gray-400 p-2 ${page === 1 ? 'ring-4 ring-blue-400' : ''}`}>
                  <div className="w-full h-full border border-gray-200 flex flex-col">
                    <div className="h-2 bg-blue-900 w-full mb-1" />
                    <div className="flex-1 border-t border-b border-gray-300 bg-[repeating-linear-gradient(0deg,transparent,transparent_4px,#e5e7eb_4px,#e5e7eb_5px)] bg-local w-full" />
                  </div>
                </div>
                <span className="text-gray-300 text-xs font-medium">{page}</span>
              </div>
            ))}
          </div>

          {/* Main Document Viewer */}
          <div className="flex-1 bg-[#525659] overflow-y-auto p-8 flex justify-center">
            {/* The PDF Page */}
            <div className="bg-white shadow-2xl w-full max-w-[900px] min-h-[1100px] flex flex-col">
              
              {/* Fake PDF Page Content */}
              <div className="p-12 pb-16 flex flex-col h-full font-sans">
                
                <div className="text-center mb-6 relative">
                  <h1 className="text-[17px] font-bold text-black uppercase">Andhra Pradesh Capital Region Development Authority</h1>
                  <h2 className="text-[15px] font-bold text-black mt-1">List of Empanelled Licensed Technical Personnel</h2>
                  <div className="absolute right-0 top-6 text-sm text-gray-700">Page 1 of {pages}</div>
                </div>

                <div className="flex-1 w-full border border-black">
                  
                  {/* First Section */}
                  <div className="flex font-bold border-b border-black text-[13px] bg-gray-100">
                    <div className="p-1 border-r border-black flex-1">Licensed Technical Personnel Type:</div>
                    <div className="p-1 w-[400px]">{isTpa ? "ECBC TPA" : isLtp ? "Licensed Technical Person (LTP)" : "Structural Engineer"}</div>
                  </div>
                  
                  <div className="flex font-bold bg-gray-50 border-b border-black text-[13px]">
                    <div className="p-1 w-12 border-r border-black text-center">Sr.No.</div>
                    <div className="p-1 w-[200px] border-r border-black text-center">LTP Name</div>
                    <div className="p-1 flex-1 border-r border-black text-center">Address</div>
                    <div className="p-1 w-24 border-r border-black text-center">Mobile</div>
                    <div className="p-1 w-[180px] text-center">Email Id</div>
                  </div>

                  {isTpa ? (
                    <>
                      {[
                        { id: 1, name: "A SUPRITH A", address: "#117, 9TH MAIN ROAD, SECTOR - 07, HSR LAYOUT, BANGALORE - 560102", mobile: "9886642773", email: "suprithaammireddy@gmail.com" },
                        { id: 2, name: "Anupozu Sridhar", address: "#303, 36 Pinnacle, Under Jubilee Hills check post Metro Station, Above Indian bank, Jubilee Hills, Hyderabad-500033.", mobile: "9246536529", email: "anupozu.s@gmail.com" },
                        { id: 3, name: "Arvind Srinivas Puppala", address: "House # 7-2-49/A/1, Ashok Colony, Near bus Stand, Sanath Nagar, Hyderabad, Telangana-500018", mobile: "9866009255", email: "as.nive2007@gmail.com" },
                        { id: 4, name: "Atul Gupta", address: "Spatium Architects, H-131,Sector 63, Noida,U.P.-201301", mobile: "9811623694", email: "teamspatium@gmail.com" },
                        { id: 5, name: "B ANAND BABU", address: "H.NO: 7-1-32/A/4, LILAC POST, LEELA NAGAR, AMEERPER, HYDERABAD - 500049", mobile: "7702377115", email: "anand@ganexconsultants.in" },
                      ].map((row) => (
                        <div key={row.id} className="flex border-b border-black text-[12px] last:border-b-0">
                          <div className="p-2 w-12 border-r border-black text-center">{row.id}</div>
                          <div className="p-2 w-[200px] border-r border-black">{row.name}</div>
                          <div className="p-2 flex-1 border-r border-black">{row.address}</div>
                          <div className="p-2 w-24 border-r border-black text-center">{row.mobile}</div>
                          <div className="p-2 w-[180px] text-blue-600 break-words">{row.email}</div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <div className="flex border-b border-black text-[12px]">
                        <div className="p-2 w-12 border-r border-black text-center">1</div>
                        <div className="p-2 w-[200px] border-r border-black uppercase">Sree Gowthami Townships Private Limited</div>
                        <div className="p-2 flex-1 border-r border-black uppercase">Flat No:102,1st Lane Harmony Homes Santhi Nagar, Guntur.<br/>Pin :522007.</div>
                        <div className="p-2 w-24 border-r border-black text-center">9059726555</div>
                        <div className="p-2 w-[180px] text-blue-600">sreegowthamitownships@gmail.com</div>
                      </div>

                      {/* Second Section */}
                      <div className="flex font-bold border-b border-black text-[13px] bg-white mt-4 border-t">
                        <div className="p-1 border-r border-black flex-1">Licensed Technical Personnel Type:</div>
                        <div className="p-1 w-[400px]">Developer</div>
                      </div>

                      <div className="flex font-bold bg-gray-50 border-b border-black text-[13px]">
                        <div className="p-1 w-12 border-r border-black text-center">Sr.No.</div>
                        <div className="p-1 w-[200px] border-r border-black text-center">LTP Name</div>
                        <div className="p-1 flex-1 border-r border-black text-center">Address</div>
                        <div className="p-1 w-24 border-r border-black text-center">Mobile</div>
                        <div className="p-1 w-[180px] text-center">Email Id</div>
                      </div>

                      {[
                        { id: 1, name: "A R CONSTRUCTIONS", address: "2-31-162/suryanarayana gari bazar/ibrahimpatnam/ntr/andhrapradesh", mobile: "9912593333", email: "arconstructions2025@gmail.com" },
                        { id: 2, name: "A RAJESH", address: "D.NO 29-19-44 DORNAKAL ROAD,SURYA RAO PET", mobile: "9703369888", email: "777arajesh@gmail.com" },
                        { id: 3, name: "A.V.S.S.R.S.SUBRAHMANYAM", address: "Flat no:4F3,VINAYAKA VIHAR,DARSIPETA,PATAMATA, VIJAYAWADA-10.", mobile: "9848691799", email: "sivaacons@gmail.com" },
                        { id: 4, name: "ADITYA PRIME PROJECTS", address: "Door No.54-15-1B, Flat No.FD1, Sri Lakshmi Kalyan Complex, 1st Road, Venkateswara Nagar, Opp. Layola College, Gunadala, Vijayawada, N.T.R District.", mobile: "9848691799", email: "adityaprimeprojects9999@gmail.com" },
                        { id: 5, name: "AJAYBUILDERS", address: "11-13-761/3,green hills colony road no.3/D,Kothapet,Saroor nagar, Ranga Reddy district,Hyderabad", mobile: "8331863850", email: "ajaybabudesigns@gmail.com" },
                        { id: 6, name: "AK CONSTRUCTIONS", address: "3,40-1-100/1,KHANS PLAZA,NARACHANDRABABU NAIDU COLONY,VIJAYAWADA,KRISHNA,AP.", mobile: "9494943130", email: "akconstructions457@gmail.com" },
                      ].map((row) => (
                        <div key={row.id} className="flex border-b border-black text-[12px] last:border-b-0">
                          <div className="p-2 w-12 border-r border-black text-center">{row.id}</div>
                          <div className="p-2 w-[200px] border-r border-black uppercase">{row.name}</div>
                          <div className="p-2 flex-1 border-r border-black uppercase">{row.address}</div>
                          <div className="p-2 w-24 border-r border-black text-center">{row.mobile}</div>
                          <div className="p-2 w-[180px] text-blue-600 break-words">{row.email}</div>
                        </div>
                      ))}
                    </>
                  )}
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
