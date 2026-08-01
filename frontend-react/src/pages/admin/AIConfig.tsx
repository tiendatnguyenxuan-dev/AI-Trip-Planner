export default function AIConfig() {
  return (
    <div className="p-10 space-y-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">AI Configuration</h1>
          <p className="text-on-surface-variant max-w-lg">Tune the Swap Engine parameters, context windows, and recommendation weights.</p>
        </div>
        <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          Deploy Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Core Parameters */}
        <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 space-y-6">
          <h2 className="text-xl font-headline font-semibold text-white">Engine Parameters</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Creativity Index (Temperature)</p>
                <p className="text-xs text-on-surface-variant">Higher values produce more unexpected suggestions.</p>
              </div>
              <span className="text-primary font-bold">0.7</span>
            </div>
            <input type="range" min="0" max="100" defaultValue="70" className="w-full h-2 bg-surface-container-highest rounded-full appearance-none outline-none accent-primary" />
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Distance Penalty</p>
                <p className="text-xs text-on-surface-variant">How much to penalize alternatives further away from the original location.</p>
              </div>
              <span className="text-primary font-bold">Medium</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-surface-container-highest text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-surface-container-high transition-colors">Low</button>
              <button className="flex-1 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-semibold transition-colors">Medium</button>
              <button className="flex-1 py-2 bg-surface-container-highest text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-surface-container-high transition-colors">High</button>
            </div>
          </div>
        </div>

        {/* Global Prompts */}
        <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 flex flex-col">
          <h2 className="text-xl font-headline font-semibold text-white mb-6">System Prompt Template</h2>
          <div className="flex-1 bg-surface-container-highest rounded-lg p-4 font-mono text-sm text-primary-fixed leading-relaxed outline-none focus-within:ring-2 focus-within:ring-primary/50 relative">
            <textarea 
              className="w-full h-full bg-transparent border-none outline-none resize-none hide-scrollbar placeholder:text-on-surface-variant/50 block"
              defaultValue={`You are an elite travel concierge. Suggest realistic, high-quality alternatives for [ORIGINAL_PLACE] that match the user's explicit preference for [USER_PREFERENCES]. Ensure the suggestion is within [MAX_RADIUS] of the original itinerary path.`}
            />
          </div>
          <p className="text-xs text-on-surface-variant mt-4 italic">Changes to the system prompt will take effect on the next engine cycle.</p>
        </div>
      </div>
    </div>
  );
}
