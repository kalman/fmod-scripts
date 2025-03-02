# fmod-scripts

My FMOD Studio scripts: https://www.fmod.com/docs/2.00/studio/scripting-terminal-reference.html

* **Add Audio Track Above/Below** (Alt + Shift? + T): I almost always prefer this to adding tracks at the bottom of events.
* **Build Banks for Event** (F8): Rebuild only the FMOD banks that the current event is in. Useful when iterating on a single event in a large FMOD project.
* **Modulate Random Pitch/Volume Up/Down** (Ctrl + Alt + P/O/V/C): Adds/removes or increases/decreases the random pitch/volume modulation for the current instrument. I do this frequently.
* **Move End Marker Right/Left** (Ctrl + Alt + E/W). Moves the "End" marker right or left in the timeline in powers-of-2 of the last item. For example, if the last item ends at 5 seconds then will move 5s, 10s, 20s, 40s, 1m20s, etc. Funky! I mostly made this so I can zoom past the end of an event.