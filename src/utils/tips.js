export const tips = [
    "Aumentar a ingestão de água em 500ml antes do treino pode melhorar sua performance em até 10%.",
    "Descansos entre 60 e 90 segundos são ideais para hipertrofia na maioria dos exercícios.",
    "Priorizar exercícios compostos no início do treino aumenta o rendimento geral.",
    "Aumentar a carga só é eficiente se a execução continuar correta.",
    "Treinar até a falha não é obrigatório em todas as séries para ter resultados.",
    "Registrar cargas e repetições ajuda a evoluir mais rápido.",
    "Consumir proteína em todas as refeições auxilia na recuperação muscular.",
    "Um lanche simples antes do treino já melhora o desempenho.",
    "Beber água ao longo do dia é mais eficiente do que apenas durante o treino.",
    "Comer bem na maior parte do tempo já traz ótimos resultados.",
    "Dormir menos de 6 horas por noite prejudica o ganho de massa muscular.",
    "O crescimento muscular acontece principalmente durante o descanso.",
    "Alongamentos leves após o treino ajudam na recuperação e mobilidade.",
    "Treinar todos os dias sem descanso pode atrasar seus resultados.",
    "Constância gera mais resultados do que motivação.",
    "Comparar-se com sua própria evolução é mais eficiente do que se comparar com outros.",
    "Mesmo um treino abaixo do ideal ainda gera benefícios.",
    "Os resultados visíveis demoram semanas, mas os benefícios começam no primeiro treino.",
    "O último exercício do treino também faz diferença.",
    "Treinar cansado ainda contribui para o progresso.",
    "Disciplina constrói resultados que a motivação não sustenta.",
    "Manter uma boa postura reduz o risco de lesões.",
    "Executar o movimento de forma controlada ativa melhor o músculo.",
    "Aquecer antes do treino melhora desempenho e reduz lesões.",
    "O excesso de treino pode ser tão prejudicial quanto a falta dele.",
    "A progressão de carga deve ser gradual e consistente.",
    "A respiração correta melhora força e estabilidade.",
    "Comer após o treino ajuda na recuperação muscular.",
    "Treinar com foco vale mais do que apenas cumprir horário.",
    "Respeitar os sinais do corpo evita lesões e interrupções longas."
];

export function getRandomTip() {
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
}
