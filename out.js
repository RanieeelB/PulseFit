import React, { useState, useEffect, useRef } from "react";
import { workoutService } from "../services/workoutService";
import WorkoutBuilder from "./WorkoutBuilder";
import { Dumbbell, Trash2, Edit2, Plus } from "lucide-react";
import { getIcon, emojiToIconMap } from "../utils/iconMap";
import { motion, AnimatePresence } from "framer-motion";
export default function WorkoutManagerModal() {
  const dialogRef = useRef(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list");
  const [editingWorkout, setEditingWorkout] = useState(null);
  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const data = await workoutService.getAll();
      setWorkouts(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const open = () => {
      loadWorkouts();
      setView("list");
      dialogRef.current?.showModal();
    };
    const close = () => dialogRef.current?.close();
    window.addEventListener("open-workout-modal", open);
    return () => window.removeEventListener("open-workout-modal", open);
  }, []);
  const handleSaveWorkout = async (workoutData) => {
    try {
      if (editingWorkout) {
        await workoutService.updateWorkout(editingWorkout.id, workoutData);
      } else {
        await workoutService.createWorkout(workoutData);
      }
      await loadWorkouts();
      setView("list");
      setEditingWorkout(null);
      window.dispatchEvent(new CustomEvent("workout-updated"));
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar treino");
    }
  };
  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir este treino?")) {
      await workoutService.deleteWorkout(id);
      await loadWorkouts();
      window.dispatchEvent(new CustomEvent("workout-updated"));
    }
  };
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.1 }
    },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };
  return /* @__PURE__ */ React.createElement("dialog", { ref: dialogRef, className: "m-auto bg-transparent p-0 backdrop:bg-black/90 backdrop:backdrop-blur-xl w-[95%] md:w-[85%] max-w-5xl h-[90vh] md:h-[85vh] rounded-[2.5rem] overflow-hidden shadow-2xl" }, /* @__PURE__ */ React.createElement(
    motion.div,
    {
      variants: modalVariants,
      initial: "hidden",
      animate: dialogRef.current?.open ? "visible" : "hidden",
      exit: "exit",
      className: "bg-[#0A0A0B] border border-white/5 w-full h-full flex flex-col relative overflow-hidden text-slate-200"
    },
    /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" }),
    /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" }),
    /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 md:px-8 md:py-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md shrink-0 relative z-10 isolate" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "p-2.5 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-white/10" }, /* @__PURE__ */ React.createElement(Dumbbell, { className: "text-white", size: 20 })), /* @__PURE__ */ React.createElement("h3", { className: "text-lg md:text-xl font-black text-white uppercase tracking-widest bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent" }, "Gerenciador de Treinos")), /* @__PURE__ */ React.createElement("button", { onClick: () => dialogRef.current?.close(), className: "w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10" }, /* @__PURE__ */ React.createElement("span", { className: "material-icons-round text-xl" }, "close"))),
    /* @__PURE__ */ React.createElement("div", { className: "p-4 md:p-8 flex-1 overflow-hidden flex flex-col relative z-10 w-full h-full" }, /* @__PURE__ */ React.createElement(AnimatePresence, { mode: "wait" }, view === "list" ? /* @__PURE__ */ React.createElement(
      motion.div,
      {
        key: "list",
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
        className: "h-full flex flex-col max-w-5xl mx-auto w-full"
      },
      /* @__PURE__ */ React.createElement(motion.div, { variants: itemVariants, className: "bg-gradient-to-r from-[#121214] to-[#1a1a24] p-6 md:p-8 rounded-[2rem] border border-white/5 text-center mb-6 relative overflow-hidden group shrink-0 shadow-lg" }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" }), /* @__PURE__ */ React.createElement("h4", { className: "font-black text-white text-2xl mb-2 relative z-10 tracking-tight" }, "Criar Novo Plano"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 mb-6 text-sm max-w-lg mx-auto relative z-10 font-medium tracking-wide" }, "Construa o treino perfeito para os seus objetivos com nossa biblioteca de exerc\xEDcios."), /* @__PURE__ */ React.createElement(
        motion.button,
        {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.98 },
          onClick: () => {
            setEditingWorkout(null);
            setView("create");
          },
          className: "relative z-10 bg-gradient-to-r from-primary to-purple-600 hover:to-primary text-white rounded-xl px-8 py-4 font-black tracking-widest uppercase shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all text-sm flex items-center gap-2 mx-auto"
        },
        /* @__PURE__ */ React.createElement(Plus, { size: 18 }),
        " MONTAR TREINO"
      )),
      /* @__PURE__ */ React.createElement(motion.div, { variants: itemVariants, className: "flex items-center justify-between mb-4 shrink-0 px-2" }, /* @__PURE__ */ React.createElement("h4", { className: "font-black text-white text-xs uppercase tracking-widest flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" }), "Seus Treinos"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black text-slate-500 tracking-widest uppercase bg-white/5 px-3 py-1.5 rounded-lg border border-white/5" }, workouts.length, " PLANOS")),
      /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 pb-4" }, loading ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center p-12 text-slate-500 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" }), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-black tracking-widest uppercase" }, "Sincronizando...")) : workouts.length === 0 ? /* @__PURE__ */ React.createElement(motion.div, { variants: itemVariants, className: "text-center py-20 border border-dashed border-white/10 rounded-[2rem] bg-white/[0.02] flex flex-col items-center justify-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6" }, /* @__PURE__ */ React.createElement(Dumbbell, { size: 40, className: "text-slate-600" })), /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-black text-white mb-2" }, "Sem Treinos Ainda"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-sm max-w-[250px]" }, "Crie seu primeiro plano de treino para come\xE7ar a acompanhar seu progresso.")) : /* @__PURE__ */ React.createElement(AnimatePresence, null, workouts.map((w, i) => /* @__PURE__ */ React.createElement(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, scale: 0.95 },
          transition: { delay: i * 0.05 },
          key: w.id,
          className: "flex items-center justify-between p-4 md:p-5 bg-[#121214] rounded-2xl border border-white/5 hover:border-primary/30 hover:bg-white/[0.03] hover:shadow-lg transition-all group"
        },
        /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-5 cursor-pointer flex-1", onClick: () => {
          setEditingWorkout(w);
          setView("create");
        } }, /* @__PURE__ */ React.createElement("div", { className: "w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/10 group-hover:scale-110 transition-transform group-hover:border-primary/50 group-hover:bg-primary/10" }, getIcon(emojiToIconMap[w.icon] || w.icon, { size: 28, className: "text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "font-black text-lg text-white group-hover:text-primary transition-colors tracking-tight mb-1" }, w.title), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg uppercase tracking-widest" }, w.exercises?.length || 0, " EXERC\xCDCIOS"), w.duration && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-black text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg uppercase tracking-widest" }, w.duration)))),
        /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 pl-4 border-l border-white/5 ml-4" }, /* @__PURE__ */ React.createElement(
          motion.button,
          {
            whileHover: { scale: 1.1 },
            whileTap: { scale: 0.9 },
            onClick: (e) => {
              e.stopPropagation();
              setEditingWorkout(w);
              setView("create");
            },
            className: "w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all border border-transparent hover:border-primary/20",
            title: "Editar"
          },
          /* @__PURE__ */ React.createElement(Edit2, { size: 18 })
        ), /* @__PURE__ */ React.createElement(
          motion.button,
          {
            whileHover: { scale: 1.1 },
            whileTap: { scale: 0.9 },
            onClick: (e) => {
              e.stopPropagation();
              handleDelete(w.id);
            },
            className: "w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20",
            title: "Excluir"
          },
          /* @__PURE__ */ React.createElement(Trash2, { size: 18 })
        ))
      ))))
    ) : /* @__PURE__ */ React.createElement(
      motion.div,
      {
        key: "create",
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
        className: "h-full w-full max-w-6xl mx-auto"
      },
      /* @__PURE__ */ React.createElement(
        WorkoutBuilder,
        {
          onSave: handleSaveWorkout,
          onCancel: () => {
            setView("list");
            setEditingWorkout(null);
          },
          initialData: editingWorkout
        }
      )
    )))
  ));
}
