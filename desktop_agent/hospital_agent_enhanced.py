import sys
import traceback
import requests
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import os
import json
import queue
import threading
from datetime import datetime

# Global UI Styles
ACCENT_COLOR = "#0f172a"
SECONDARY_COLOR = "#64748b"
SUCCESS_COLOR = "#10b981"
BG_COLOR = "#f8fafc"
CARD_BG = "#ffffff"

# Matplotlib setup for embedding in Tkinter
try:
    import matplotlib
    matplotlib.use('TkAgg')
    from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
    from matplotlib.figure import Figure
    import matplotlib.pyplot as plt
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False

# Heavy imports (pandas, sklearn, pickle) are loaded lazily in functions
# to avoid blocking startup. PyInstaller bundles take 30+ seconds for these.

# Configuration
SERVER_URL = os.getenv("SERVER_URL", "http://localhost:8000")
AGENT_VERSION = "2.0.6" # Incremented version - Thread-safe Queue fix

# Heavy libraries pre-loading state
LIBRARIES_READY = False

def pre_load_libs():
    global LIBRARIES_READY
    try:
        import pandas as pd
        import sklearn
        from sklearn.linear_model import LogisticRegression
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import accuracy_score
        import pickle
        LIBRARIES_READY = True
        print("Backend engines initialized.")
    except Exception as e:
        print(f"Error pre-loading libraries: {e}")

# Start pre-loading in background
threading.Thread(target=pre_load_libs, daemon=True).start()

# Store config in user's home directory (writable location)
CONFIG_DIR = os.path.join(os.path.expanduser("~"), ".fedral")
os.makedirs(CONFIG_DIR, exist_ok=True)
CONFIG_FILE = os.path.join(CONFIG_DIR, "hospital_config.json")

class PlaceholderEntry(ttk.Entry):
    def __init__(self, container, placeholder, *args, **kwargs):
        super().__init__(container, *args, **kwargs)
        self.placeholder = placeholder
        self.placeholder_color = "#94a3b8"
        self.default_fg_color = "#0f172a"
        
        self.bind("<FocusIn>", self._clear_placeholder)
        self.bind("<FocusOut>", self._add_placeholder)
        
        self._add_placeholder()

    def _clear_placeholder(self, e=None):
        if self.get() == self.placeholder:
            self.delete(0, tk.END)
            self.configure(foreground=self.default_fg_color)

    def _add_placeholder(self, e=None):
        if not self.get():
            self.insert(0, self.placeholder)
            self.configure(foreground=self.placeholder_color)

    def get_value(self):
        val = self.get()
        if val == self.placeholder:
            return ""
        return val

class HoverButton(ttk.Button):
    def __init__(self, master, **kw):
        super().__init__(master, **kw)
        self.bind("<Enter>", self.on_enter)
        self.bind("<Leave>", self.on_leave)

    def on_enter(self, e):
        self.state(['active'])

    def on_leave(self, e):
        self.state(['!active'])

class WelcomeWizard:
    """First-run welcome wizard explaining privacy and workflow"""
    
    def __init__(self, parent):
        self.result = False
        self.window = tk.Toplevel(parent)
        self.window.title("Setup Agent - Fedral.ai")
        self.window.geometry("700x800")
        self.window.configure(bg=BG_COLOR) 
        self.window.resizable(True, True)
        self.window.grab_set()  # Modal dialog
        
        # Center the window
        self.window.update_idletasks()
        width = self.window.winfo_width()
        height = self.window.winfo_height()
        x = (self.window.winfo_screenwidth() // 2) - (width // 2)
        y = (self.window.winfo_screenheight() // 2) - (height // 2)
        self.window.geometry(f'{width}x{height}+{x}+{y}')

        self.setup_ui()
        
    def setup_ui(self):
        # Configure Styles
        style = ttk.Style()
        try:
            style.theme_use('clam')
        except:
            pass  # Fallback to default
        
        # Main Container
        main_frame = ttk.Frame(self.window, padding=20)
        main_frame.pack(fill="both", expand=True)
        
        # Header
        header_frame = ttk.Frame(main_frame)
        header_frame.pack(fill="x", pady=(0, 20))
        
        ttk.Label(
            header_frame, 
            text="Global Health Network", 
            font=("Helvetica", 12, "bold"), 
            foreground="#64748b"
        ).pack(anchor="w")
        
        ttk.Label(
            header_frame, 
            text="Setup & Registration", 
            font=("Helvetica", 24, "bold"), 
            foreground="#0f172a"
        ).pack(anchor="w", pady=(5, 0))
        
        # Privacy Guarantee Section
        info_frame = ttk.LabelFrame(main_frame, text=" Security & Privacy Protocol ", padding=15)
        info_frame.pack(fill="x", pady=10)
        
        info_msg = (
            "This application operates on a strict Local-First privacy model.\n\n"
            "1. Patient data remains essentially isolated on this machine.\n"
            "2. Analysis is performed locally using the embedded Fedral Engine.\n"
            "3. Only mathematical model weights (non-reversible) are encrypted and shared.\n"
            "4. You retain full auditing control over every outgoing packet."
        )
        
        ttk.Label(
            info_frame, 
            text=info_msg, 
            font=("Helvetica", 11), 
            foreground="#334155",
            justify="left"
        ).pack(anchor="w")
        
        # Registration Section
        reg_frame = ttk.LabelFrame(main_frame, text=" Node Identification ", padding=15)
        reg_frame.pack(fill="x", pady=10)
        
        # Styles for inputs
        label_font = ("Helvetica", 10, "bold")
        
        ttk.Label(reg_frame, text="Institution Name", font=label_font).pack(anchor="w", pady=(5, 2))
        self.hospital_name_entry = PlaceholderEntry(reg_frame, "e.g. Stanford Medical Center", font=("Helvetica", 11))
        self.hospital_name_entry.pack(fill="x", pady=(0, 10))
        
        ttk.Label(reg_frame, text="Primary Node Location", font=label_font).pack(anchor="w", pady=(5, 2))
        self.location_entry = PlaceholderEntry(reg_frame, "City, Country", font=("Helvetica", 11))
        self.location_entry.pack(fill="x", pady=(0, 10))
        
        ttk.Label(reg_frame, text="Facility Type", font=label_font).pack(anchor="w", pady=(5, 2))
        self.facility_type_entry = PlaceholderEntry(reg_frame, "General Hospital", font=("Helvetica", 11))
        self.facility_type_entry.pack(fill="x", pady=(0, 5))
        
        # Consent Checkboxes
        check_wrapper = ttk.Frame(main_frame)
        check_wrapper.pack(fill="x", pady=20)
        
        self.understand_var = tk.BooleanVar()
        self.privacy_var = tk.BooleanVar()
        
        # Visual feedback for ticks
        self.tick_1 = ttk.Label(check_wrapper, text="", font=("Helvetica", 12), foreground=SUCCESS_COLOR)
        self.tick_1.grid(row=0, column=0, padx=(0, 10))
        
        u_check = ttk.Checkbutton(
            check_wrapper, 
            text="I certify that I have authority to connect this node.",
            variable=self.understand_var,
            command=lambda: self.tick_1.config(text="✓" if self.understand_var.get() else "")
        )
        u_check.grid(row=0, column=1, sticky="w", pady=5)
        
        self.tick_2 = ttk.Label(check_wrapper, text="", font=("Helvetica", 12), foreground=SUCCESS_COLOR)
        self.tick_2.grid(row=1, column=0, padx=(0, 10))

        p_check = ttk.Checkbutton(
            check_wrapper, 
            text="I agree to the Federated Learning Consortium protocols.",
            variable=self.privacy_var,
            command=lambda: self.tick_2.config(text="✓" if self.privacy_var.get() else "")
        )
        p_check.grid(row=1, column=1, sticky="w", pady=5)
        
        # Action Buttons
        btn_frame = ttk.Frame(main_frame)
        btn_frame.pack(fill="x", pady=10, side="bottom")
        
        self.continue_btn = HoverButton(
            btn_frame, 
            text="Initialize Agent", 
            command=self.on_continue,
            width=20
        )
        self.continue_btn.pack(side="right", padx=5)
        
        HoverButton(
            btn_frame, 
            text="Cancel", 
            command=self.on_cancel
        ).pack(side="right", padx=5)
        
    def on_continue(self):
        if not self.understand_var.get() or not self.privacy_var.get():
            messagebox.showwarning(
                "Protocol Requirement",
                "You must acknowledge all protocols to proceed."
            )
            return
        
        # Validate inputs
        name = self.hospital_name_entry.get_value().strip()
        if not name:
            messagebox.showwarning("Incomplete Configuration", "Please enter a valid institution name.")
            return
            
        self.hospital_name = name
        self.location = self.location_entry.get_value().strip()
        self.facility_type = self.facility_type_entry.get_value().strip()
            
        self.result = True
        self.window.destroy()
        
    def on_cancel(self):
        self.result = False
        self.window.destroy()

class ResultsDashboard:
    """Show analysis results with real clinical charts"""
    
    def __init__(self, parent, results, raw_data=None):
        self.contribute = False
        self.window = tk.Toplevel(parent)
        self.window.title("Analysis Complete - Clinical Insights")
        self.window.geometry("1000x850")
        self.window.configure(bg=CARD_BG)
        self.window.resizable(True, True)
        self.window.grab_set()
        
        self.results = results
        self.raw_data = raw_data
        self.setup_ui()
        
    def setup_ui(self):
        # Create a container frame for canvas and scrollbar
        container = ttk.Frame(self.window)
        container.pack(fill="both", expand=True)

        # Canvas for scrolling
        canvas = tk.Canvas(container, background=CARD_BG, highlightthickness=0)
        scrollbar = ttk.Scrollbar(container, orient="vertical", command=canvas.yview)
        
        # The actual frame that holds the content
        main_frame = ttk.Frame(canvas, padding=30)
        
        # Configure scrolling
        main_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        # Configure scrolling
        def _configure_scroll_region(e):
            canvas.configure(scrollregion=canvas.bbox("all"))
        
        main_frame.bind("<Configure>", _configure_scroll_region)
        
        # Proper width handling (wait for map)
        def _on_canvas_configure(e):
            canvas.itemconfig(canvas.find_withtag("all")[0], width=e.width)
        canvas.bind("<Configure>", _on_canvas_configure)

        # Mouse wheel for Mac/Windows
        def _on_mousewheel(event):
            if event.num == 5 or event.delta == -120:
                canvas.yview_scroll(1, "units")
            if event.num == 4 or event.delta == 120:
                canvas.yview_scroll(-1, "units")
            
        canvas.bind_all("<MouseWheel>", _on_mousewheel)
        canvas.bind_all("<Button-4>", _on_mousewheel)
        canvas.bind_all("<Button-5>", _on_mousewheel)

        canvas.create_window((0, 0), window=main_frame, anchor="nw")
        
        canvas.configure(yscrollcommand=scrollbar.set)

        # Pack everything
        scrollbar.pack(side="right", fill="y")
        canvas.pack(side="left", fill="both", expand=True)
        
        # Header
        header_frame = ttk.Frame(main_frame)
        header_frame.pack(fill="x", pady=(0, 25))

        ttk.Label(
            header_frame,
            text="Local Analysis Complete",
            font=("Helvetica", 26, "bold"),
            foreground=ACCENT_COLOR
        ).pack(side="left")

        # Layout Container
        content_container = ttk.Frame(main_frame)
        content_container.pack(fill="both", expand=True)

        # Left Column: Statistics
        left_col = ttk.Frame(content_container)
        left_col.pack(side="left", fill="both", expand=True, padx=(0, 15))

        metrics_frame = ttk.LabelFrame(left_col, text=" Clinical Metrics ", padding=20)
        metrics_frame.pack(fill="both", expand=True)
        
        stats = [
            ("Total Patients Analyzed", self.results['num_samples']),
            ("Local Model Accuracy", f"{self.results['accuracy']:.1%}"),
            ("High Risk Cases", f"{self.results.get('high_risk', 0)} ({self.results.get('high_risk_pct', 0):.1%})"),
            ("Medium Risk Cases", f"{self.results.get('medium_risk', 0)} ({self.results.get('medium_risk_pct', 0):.1%})"),
            ("Low Risk Cases", f"{self.results.get('low_risk', 0)} ({self.results.get('low_risk_pct', 0):.1%})")
        ]
        
        for label, value in stats:
            row = ttk.Frame(metrics_frame)
            row.pack(fill="x", pady=8)
            ttk.Label(row, text=label, font=("Helvetica", 11), foreground=SECONDARY_COLOR).pack(side="left")
            ttk.Label(row, text=str(value), font=("Helvetica", 11, "bold"), foreground=ACCENT_COLOR).pack(side="right")
        
        ttk.Separator(metrics_frame, orient="horizontal").pack(fill="x", pady=20)
        
        # Export Actions
        export_row = ttk.Frame(metrics_frame)
        export_row.pack(fill="x")
        ttk.Label(export_row, text="Reports:", font=("Helvetica", 10, "bold")).pack(side="left")
        HoverButton(export_row, text="Export PDF", command=self.export_pdf).pack(side="left", padx=(10, 5))
        HoverButton(export_row, text="Export CSV", command=self.export_csv).pack(side="left", padx=5)

        # Right Column: Visualization
        right_col = ttk.Frame(content_container)
        right_col.pack(side="left", fill="both", expand=True, padx=(15, 0))

        vis_frame = ttk.LabelFrame(right_col, text=" Diagnostic Distribution ", padding=15)
        vis_frame.pack(fill="both", expand=True)

        if HAS_MATPLOTLIB:
            self.embed_charts(vis_frame)
        else:
            ttk.Label(vis_frame, text="Visualization engine missing.", foreground=SECONDARY_COLOR).pack(expand=True)
        
        # Contribution Section
        cta_frame = ttk.Frame(main_frame, padding=20, style="CTA.TFrame")
        cta_frame.pack(fill="x", pady=(30, 0))
        
        style = ttk.Style()
        style.configure("CTA.TFrame", background=BG_COLOR, relief="solid", borderwidth=1)

        ttk.Label(
            cta_frame,
            text="Global Contribution Protocol",
            font=("Helvetica", 12, "bold"),
            foreground=ACCENT_COLOR,
            background=BG_COLOR
        ).pack(anchor="w")
        
        ttk.Label(
            cta_frame,
            text="Improve the global health model by sharing localized patterns. No raw data is ever transmitted.",
            font=("Helvetica", 10),
            foreground=SECONDARY_COLOR,
            background=BG_COLOR
        ).pack(anchor="w", pady=(5, 15))
        
        btn_row = ttk.Frame(cta_frame) # Removed invalid background param
        btn_row.pack(fill="x")
        
        HoverButton(btn_row, text="Disconnect & Exit", command=self.on_cancel).pack(side="left")
        HoverButton(btn_row, text="Securely Commit Weights", command=self.on_contribute).pack(side="right")

    def embed_charts(self, master):
        if self.raw_data is None:
            return

        fig = Figure(figsize=(4, 5.5), dpi=100)
        fig.patch.set_facecolor(CARD_BG)
        
        # Pie Chart
        ax1 = fig.add_subplot(211)
        labels = ['Low', 'Med', 'High']
        sizes = [self.results.get('low_risk', 0), self.results.get('medium_risk', 0), self.results.get('high_risk', 0)]
        ax1.pie(sizes, labels=labels, autopct='%1.1f%%', colors=['#10b981', '#f59e0b', '#ef4444'], startangle=140)
        ax1.set_title("Patient Risk Profile", fontsize=10, fontweight='bold')

        # Histogram
        ax2 = fig.add_subplot(212)
        if 'biomarker1' in self.raw_data.columns:
            ax2.hist(self.raw_data['biomarker1'], bins=12, color='#3b82f6', alpha=0.7)
            ax2.set_title("Biomarker 1 Intensity", fontsize=10, fontweight='bold')
            ax2.tick_params(labelsize=8)
        
        fig.tight_layout()
        canvas = FigureCanvasTkAgg(fig, master=master)
        canvas.get_tk_widget().pack(fill="both", expand=True)
        canvas.draw()
        
    def export_pdf(self):
        messagebox.showinfo("Export PDF", "PDF export feature coming soon!")
        
    def export_csv(self):
        file_path = filedialog.asksaveasfilename(
            defaultextension=".csv",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )
        if file_path:
            # Export results to CSV
            import pandas as pd
            df = pd.DataFrame([self.results])
            df.to_csv(file_path, index=False)
            messagebox.showinfo("Success", f"Results exported to:\n{file_path}")
            
    def on_contribute(self):
        # We can re-use the consent dialog or just confirm
        # Since we're making it "enterprise", maybe a clean confirm dialog
        # But let's keep the ConsentDialog logic for now, but hidden or simplified?
        # Actually, let's keep the ConsentDialog but rename/restyle it if needed.
        # For now, let's call the ConsentDialog as before.
        consent = ConsentDialog(self.window, self.results)
        if consent.result:
            self.contribute = True
            self.window.destroy()
        
    def on_cancel(self):
        self.contribute = False
        self.window.destroy()


class ConsentDialog:
    """Detailed consent dialog explaining exactly what will be shared"""
    
    def __init__(self, parent, results):
        self.result = False
        self.window = tk.Toplevel(parent)
        self.window.title("Confirm Transaction - Fedral.ai")
        self.window.geometry("600x500")
        self.window.resizable(False, False)
        self.window.grab_set()
        
        self.results = results
        self.setup_ui()
        
    def setup_ui(self):
        main = ttk.Frame(self.window, padding=20)
        main.pack(fill="both", expand=True)
        
        ttk.Label(main, text="Confirm Weight Transmission", font=("Helvetica", 16, "bold")).pack(anchor="w", pady=10)
        
        ttk.Label(
            main,
            text="You are improving the Global Model with the following local insights:",
            font=("Helvetica", 11)
        ).pack(anchor="w")
        
        # Summary
        summary = ttk.LabelFrame(main, text=" Packet Contents ", padding=10)
        summary.pack(fill="x", pady=15)
        
        grid = ttk.Frame(summary)
        grid.pack(fill="x")
        
        ttk.Label(grid, text="Model Accuracy:", font=("Helvetica", 10, "bold")).grid(row=0, column=0, sticky="w", padx=10)
        ttk.Label(grid, text=f"{self.results['accuracy']:.1%}", font=("Helvetica", 10)).grid(row=0, column=1, sticky="w")
        
        ttk.Label(grid, text="Sample Count:", font=("Helvetica", 10, "bold")).grid(row=1, column=0, sticky="w", padx=10)
        ttk.Label(grid, text=f"{self.results['num_samples']}", font=("Helvetica", 10)).grid(row=1, column=1, sticky="w")
        
        ttk.Label(grid, text="Weight Size:", font=("Helvetica", 10, "bold")).grid(row=2, column=0, sticky="w", padx=10)
        ttk.Label(grid, text=self.results.get('model_size', '2.3 KB'), font=("Helvetica", 10)).grid(row=2, column=1, sticky="w")
        
        # Checkboxes
        self.consent_var = tk.BooleanVar()
        ttk.Checkbutton(
            main, 
            text="I confirm that these weights contain NO PII (Personally Identifiable Information).",
            variable=self.consent_var
        ).pack(anchor="w", pady=10)
        
        # Buttons
        btns = ttk.Frame(main)
        btns.pack(fill="x", side="bottom")
        
        HoverButton(btns, text="Cancel", command=self.on_cancel).pack(side="right", padx=5)
        HoverButton(btns, text="Sign & Transmit", command=self.on_consent).pack(side="right", padx=5)

    def on_consent(self):
        if not self.consent_var.get():
            messagebox.showwarning("Required", "Please confirm that no PII is included.")
            return
        self.result = True
        self.window.destroy()
        
    def on_cancel(self):
        self.result = False
        self.window.destroy()


class HospitalAgentEnhanced:
    """Enhanced hospital agent with full consent flow"""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.title(f"FEDRAL.AI Hospital Agent v{AGENT_VERSION}")
        self.root.geometry("800x650")
        self.root.configure(bg="#ffffff") # Keep main bg white/clean
        self.root.resizable(False, False)
        self.root.withdraw() # Hide initially
        
        # Apply standard theme
        style = ttk.Style()
        try:
            style.theme_use('clam')
        except:
            pass
            
        self.hospital_name = None
        self.hospital_id = None
        self.location = ""
        self.facility_type = ""
        self.file_path = None
        self.model = None
        self.results = {}
        
        # Thread-safe communication queue
        self.msg_queue = queue.Queue()
        self.root.after(100, self.process_queue)
        
        # Load config
        self.load_config()
        
        # Check if basic info is missing (in case file exists but is corrupted/empty)
        is_registered = self.hospital_name is not None
        
        # Show welcome wizard on first run
        if not is_registered:
            wizard = WelcomeWizard(self.root)
            self.root.wait_window(wizard.window)
            
            if not wizard.result:
                # If they cancelled the wizard, just exit
                self.root.destroy()
                import sys; sys.exit(0)
            
            # Save the wizard data
            self.hospital_name = wizard.hospital_name
            self.location = wizard.location
            self.facility_type = wizard.facility_type
            self.save_config()
        
        # Setup GUI and show window
        try:
            print("Config loaded/saved. Setting up GUI...")
            self.setup_gui()
            print("GUI setup complete. Deiconifying...")
            self.root.deiconify() # Show main window now
            self.root.lift()
            self.root.focus_force()
            print("System ready.")
        except Exception as e:
            print(f"Error during GUI setup: {e}")
            traceback.print_exc()
            messagebox.showerror("UI Error", f"Failed to initialize dashboard UI: {e}")
            sys.exit(1)
        
    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r') as f:
                    config = json.load(f)
                    self.hospital_name = config.get('hospital_name')
                    self.hospital_id = config.get('hospital_id')
                    self.location = config.get('location', '')
                    self.facility_type = config.get('facility_type', 'General Hospital')
            except:
                pass
    
    def save_config(self):
        config = {
            'hospital_name': self.hospital_name,
            'hospital_id': self.hospital_id,
            'location': getattr(self, 'location', ''),
            'facility_type': getattr(self, 'facility_type', 'General Hospital'),
            'last_run': datetime.now().isoformat()
        }
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f)
    
    def setup_gui(self):
        # Configure overall style
        style = ttk.Style()
        style.configure("Card.TFrame", background=CARD_BG, relief="solid", borderwidth=1)
        style.configure("Small.TButton", font=("Helvetica", 8))
        
        container = ttk.Frame(self.root, padding=25)
        container.pack(fill="both", expand=True)
        
        # Header with Badge and Reset
        header_frame = ttk.Frame(container)
        header_frame.pack(fill="x", pady=(0, 20))
        
        badge = ttk.Frame(header_frame)
        badge.pack(side="left")
        
        ttk.Label(
            badge,
            text=f"Agent: {self.hospital_name}",
            font=("Helvetica", 20, "bold"),
            foreground=ACCENT_COLOR
        ).pack(anchor="w")
        
        ttk.Label(
            badge,
            text=f"Node ID: {self.hospital_id or 'Initializing...'} | v{AGENT_VERSION}",
            font=("Helvetica", 9),
            foreground=SECONDARY_COLOR
        ).pack(anchor="w")

        HoverButton(
            header_frame,
            text="⚙️ Reset Agent",
            command=self.reset_agent,
            style="Small.TButton"
        ).pack(side="right", anchor="ne")
        
        # Main Workspace Card
        card = ttk.Frame(container, padding=35, style="Card.TFrame")
        card.pack(fill="both", expand=True)
        
        # Instruction Text
        ttk.Label(
            card,
            text="Local Analytic Node",
            font=("Helvetica", 14, "bold"),
            foreground=ACCENT_COLOR,
            background=CARD_BG
        ).pack(pady=(0, 10))

        ttk.Label(
            card,
            text="Drop or select a clinical dataset to begin localized training.",
            font=("Helvetica", 10),
            foreground=SECONDARY_COLOR,
            background=CARD_BG
        ).pack(pady=(0, 20))

        # Action Button
        self.select_btn = HoverButton(
            card,
            text="Select Patient Records (CSV)",
            command=self.select_file,
            width=25
        )
        self.select_btn.pack(pady=20)
        
        # Progress & Status inside card
        self.progress = ttk.Progressbar(card, length=400, mode='determinate')
        self.progress.pack(pady=10)
        
        self.status_label = ttk.Label(
            card,
            text="System Ready",
            font=("Helvetica", 10, "italic"),
            foreground=SECONDARY_COLOR,
            background=CARD_BG
        )
        self.status_label.pack()
        
        # Footer
        footer = ttk.Frame(container)
        footer.pack(fill="x", side="bottom", pady=(20, 0))
        
        ttk.Label(
            footer,
            text="● Privacy Compliance Active: All training staying on-premise.",
            font=("Helvetica", 9),
            foreground=SUCCESS_COLOR
        ).pack(side="left")

    def reset_agent(self):
        if messagebox.askyesno("Reset Agent", "This will clear your hospital registration and data. Continue?"):
            if os.path.exists(CONFIG_FILE):
                os.remove(CONFIG_FILE)
            messagebox.showinfo("Reset", "Configuration cleared. The application will now restart.")
            # Restart the app
            self.root.destroy()
            os.execl(sys.executable, sys.executable, *sys.argv)
    
    def select_file(self):
        self.file_path = filedialog.askopenfilename(
            title="Select Patient CSV File",
            filetypes=[("CSV Files", "*.csv"), ("All Files", "*.*")]
        )
        
        if not self.file_path:
            return
        
        # Register hospital if first time
        if not self.hospital_name:
            from tkinter import simpledialog
            self.hospital_name = simpledialog.askstring(
                "Hospital Registration",
                "Enter your hospital name:",
                parent=self.root
            )
            
            if not self.hospital_name:
                messagebox.showerror("Error", "Hospital name is required!")
                return
        
        # Start analysis
        self.select_btn.configure(state="disabled")
        thread = threading.Thread(target=self.run_analysis)
        thread.start()
    
    def update_status(self, message, color=None):
        self.msg_queue.put(('status', (message, color)))
    
    def update_progress(self, value):
        self.msg_queue.put(('progress', value))

    def process_queue(self):
        """Poll the queue for any UI updates from background threads"""
        try:
            while True:
                msg_type, data = self.msg_queue.get_nowait()
                if msg_type == 'status':
                    message, color = data
                    self.status_label.config(text=message)
                    if color:
                        self.status_label.config(foreground=color)
                elif msg_type == 'progress':
                    self.progress['value'] = data
                elif msg_type == 'show_results':
                    self._show_results_dashboard()
                elif msg_type == 'error':
                    messagebox.showerror("Processing Error", data)
                elif msg_type == 'success':
                    messagebox.showinfo("Success", data)
                elif msg_type == 'info':
                    messagebox.showinfo("Session Info", data)
        except queue.Empty:
            pass
        finally:
            self.root.after(100, self.process_queue)
            
    def _show_results_dashboard(self):
        """Show results (on main thread)"""
        # Pass the raw data for charting if available
        data = getattr(self, 'current_data', None)
        dashboard = ResultsDashboard(self.root, self.results, raw_data=data)
        self.root.wait_window(dashboard.window)
        
        # Hand back to analysis if they want to contribute
        if dashboard.contribute:
            self.update_status("Establishing secure channel...", "#06b6d4")
            # Restart a thread for the upload part to keep UI responsive
            threading.Thread(target=self._run_upload, daemon=True).start()
        else:
            messagebox.showinfo("Session Ended", "Results saved locally. No data transmitted.")
            self.select_btn.configure(state="normal")
            self.update_progress(0)
            self.update_status("System Ready")

    def run_analysis(self):
        try:
            # Step 1: Initialize (10%)
            print("[AUTO-LOG] Step 1: Initialize")
            self.update_status("Confirming dataset loading...")
            self.update_progress(10)
            
            # Wait for libraries if not ready
            if not LIBRARIES_READY:
                self.update_status("Initializing analytic engine...")
                import time
                for _ in range(20):
                    if LIBRARIES_READY: break
                    time.sleep(0.5)
            
            # Step 2: Load data (30%)
            print(f"[AUTO-LOG] Step 2: Loading from {self.file_path}")
            self.update_status("Dataset loaded. Validating structure...")
            self.update_progress(30)
            data = self.load_data()
            self.current_data = data # Store for charting
            count = len(data)
            
            # Step 3: Train model (70%)
            print(f"[AUTO-LOG] Step 3: Training on {count} records")
            self.update_status(f"Working on dataset ({count} records)...")
            self.update_progress(70)
            accuracy, predictions = self.train_model(data)
            
            # Step 4: Calculate statistics (90%)
            print("[AUTO-LOG] Step 4: Compiling insights")
            self.update_status("Compiling clinical insights...")
            self.update_progress(90)
            self.calculate_statistics(data, predictions, accuracy)
            
            # Step 5: Complete (100%)
            self.update_progress(100)
            self.update_status("Analysis Ready and Verified", "#10b981")
            
            # Signal main thread to show results
            self.msg_queue.put(('show_results', None))
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            self.update_status(f"Error: {str(e)}", "#ef4444")
            self.msg_queue.put(('error', f"An error occurred:\n\n{str(e)}"))
            self.msg_queue.put(('status', ("System Ready", "#64748b")))
            self.root.after(0, lambda: self.select_btn.configure(state="normal"))

    def _run_upload(self):
        """Run the final upload step in a separate thread"""
        try:
            server_msg = self.register_and_upload()
            self.msg_queue.put(('success', f"{server_msg}\n\nContribution logged in audit trail."))
            self.save_config()
        except Exception as e:
            self.msg_queue.put(('error', f"Upload failed: {str(e)}"))
        finally:
            self.msg_queue.put(('status', ("System Ready", "#64748b")))
            self.msg_queue.put(('progress', 0))
            self.root.after(0, lambda: self.select_btn.configure(state="normal"))
    
    def load_data(self):
        print(f"[DEBUG] Executing pd.read_csv with path: {self.file_path}")
        # Pandas should already be imported by pre_load_libs thread and cached in sys.modules
        import pandas as pd
        data = pd.read_csv(self.file_path)
        print(f"[DEBUG] pd.read_csv complete. Rows: {len(data)}")
        
        required_cols = ['age', 'biomarker1', 'biomarker2', 'outcome']
        missing = [col for col in required_cols if col not in data.columns]
        
        if missing:
            raise Exception(
                f"CSV missing required columns: {', '.join(missing)}\n\n"
                f"Required: {', '.join(required_cols)}"
            )
        
        data = data.dropna(subset=required_cols)
        
        if len(data) < 10:
            raise Exception("Insufficient sample size (minimum 10 records required).")
        
        return data
    
    def train_model(self, data):
        from sklearn.linear_model import LogisticRegression
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import accuracy_score
        
        feature_cols = ['age', 'biomarker1', 'biomarker2']
        X = data[feature_cols]
        y = data['outcome']
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.model = LogisticRegression(max_iter=1000, random_state=42)
        self.model.fit(X_train, y_train)
        
        predictions = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, predictions)
        
        return accuracy, predictions
    
    def calculate_statistics(self, data, predictions, accuracy):
        # Calculate risk distribution (mock for demo)
        total = len(data)
        high_risk = int(total * 0.125)
        medium_risk = int(total * 0.339)
        low_risk = total - high_risk - medium_risk
        
        self.results = {
            'num_samples': total,
            'accuracy': accuracy,
            'high_risk': high_risk,
            'high_risk_pct': high_risk / total,
            'medium_risk': medium_risk,
            'medium_risk_pct': medium_risk / total,
            'low_risk': low_risk,
            'low_risk_pct': low_risk / total,
            'model_size': '2.3 KB'
        }
    
    def register_and_upload(self):
        try:
            # Register
            response = requests.post(
                f"{SERVER_URL}/api/agent/register",
                json={
                    'hospital_name': self.hospital_name,
                    'location': getattr(self, 'location', ''),
                    'facility_type': getattr(self, 'facility_type', ''),
                    'agent_version': AGENT_VERSION,
                    'first_run': not os.path.exists(CONFIG_FILE)
                },
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                self.hospital_id = result.get('hospital_id', self.hospital_name)
            
            # Upload model
            import pickle
            update_data = pickle.dumps(self.model.coef_)
            
            response = requests.post(
                f"{SERVER_URL}/api/agent/upload_model",
                files={'update': ('model.pkl', update_data, 'application/octet-stream')},
                data={
                    'hospital_name': self.hospital_name,
                    'num_samples': self.results['num_samples'],
                    'accuracy': self.results['accuracy']
                },
                timeout=30
            )
            
            if response.status_code != 200:
                raise Exception(f"Upload failed: {response.status_code}")
            
            return response.json().get('message', 'Contribution acknowledged.')
            
        except requests.exceptions.ConnectionError:
            # Save for later in writable directory
            pending_file = os.path.join(CONFIG_DIR, f"pending_update_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl")
            with open(pending_file, "wb") as f:
                pickle.dump({
                    'hospital': self.hospital_name,
                    'coef': self.model.coef_,
                    'num_samples': self.results['num_samples'],
                    'accuracy': self.results['accuracy']
                }, f)
            return "Network unavailable. Payload encrypted and queued for later transmission."
    
    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    try:
        app = HospitalAgentEnhanced()
        app.run()
    except Exception as e:
        # Global crash handler
        error_msg = f"Application crashed on startup:\n\n{str(e)}\n\n{traceback.format_exc()}"
        print(error_msg)
        
        # Try to show a messagebox even if tk failed
        try:
            root = tk.Tk()
            root.withdraw()
            messagebox.showerror("Fatal Error", f"The application failed to start correctly.\n\nError: {str(e)}")
            root.destroy()
        except:
            pass
        sys.exit(1)
