/* GuiGym: Lucide + Chart.js. Os dados continuam apenas em forgeDB. */
(() => {
  'use strict';

  const originalDrawChart = window.drawChart;
  const originalRenderProgress = window.renderProgress;
  const instances = new Map();
  const red = '#ff3653';
  const green = '#68dbaa';
  const muted = '#b6a7ae';

  function clearChart(key) {
    if (instances.has(key)) {
      instances.get(key).destroy();
      instances.delete(key);
    }
  }

  function chartOptions(unit, startAtZero = true) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 260 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#231820',
          borderColor: '#744051',
          borderWidth: 1,
          padding: 11,
          displayColors: false,
          callbacks: { label: context => `${context.parsed.y.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${unit}` }
        }
      },
      scales: {
        x: { ticks: { color: muted, maxRotation: 0, autoSkip: true }, grid: { display: false }, border: { color: '#4e303b' } },
        y: {
          beginAtZero: startAtZero,
          ticks: { color: muted, precision: unit === 'kg' ? 1 : 0, maxTicksLimit: 5 },
          grid: { color: 'rgba(255, 255, 255, .055)' },
          border: { display: false }
        }
      }
    };
  }

  function plot(key, target, labels, values, unit, type = 'line', color = red, zero = true) {
    if (!target) return;
    clearChart(key);
    target.replaceChildren();
    if (!window.Chart) {
      const message = document.createElement('div');
      message.className = 'gg-chart-empty';
      message.textContent = 'Gráfico indisponível neste navegador. Seus dados continuam salvos.';
      target.appendChild(message);
      return;
    }
    if (!values.length) {
      const message = document.createElement('div');
      message.className = 'gg-chart-empty';
      message.textContent = 'Registre treinos ou medidas para começar a acompanhar sua evolução.';
      target.appendChild(message);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `${unit} por período: ${values.map((v, i) => `${labels[i]}: ${v}`).join('; ')}`);
    target.appendChild(canvas);
    const data = {
      labels,
      datasets: [{
        data: values,
        borderColor: color,
        backgroundColor: type === 'bar' ? 'rgba(255, 54, 83, .65)' : 'rgba(255, 54, 83, .12)',
        pointBackgroundColor: green,
        pointBorderWidth: 0,
        pointRadius: values.length > 18 ? 2 : 4,
        pointHoverRadius: 6,
        borderWidth: 2.5,
        fill: type === 'line',
        tension: .28,
        borderRadius: type === 'bar' ? 5 : 0,
        maxBarThickness: 32
      }]
    };
    instances.set(key, new window.Chart(canvas, { type, data, options: chartOptions(unit, zero) }));
  }

  function enhancedDrawChart(name) {
    const box = document.getElementById('loadChart');
    if (!box) return;
    if (!window.Chart) return originalDrawChart?.(name);

    clearChart('load');
    box.replaceChildren();
    if (!name) {
      box.className = 'empty';
      box.textContent = 'Selecione um exercício para visualizar a evolução da carga.';
      return;
    }
    const points = db.logs.flatMap(log => (log.entries || [])
      .filter(entry => entry.name === name && Number(entry.weight) > 0)
      .map(entry => ({
        date: new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        weight: Number(entry.weight)
      })));
    if (!points.length) {
      box.className = 'empty';
      box.textContent = 'Sem registros de carga para este exercício.';
      return;
    }

    box.className = 'gg-load-chart';
    const heading = document.createElement('div');
    heading.className = 'gg-chart-heading';
    const label = document.createElement('b');
    label.textContent = name; // Nunca interpola um nome personalizado em HTML.
    const last = document.createElement('span');
    last.className = 'tiny muted';
    last.textContent = `Última: ${fmt(points.at(-1).weight)} kg`;
    heading.append(label, last);
    const area = document.createElement('div');
    area.className = 'gg-chart-area';
    const summary = document.createElement('div');
    summary.className = 'history-item';
    const summaryLabel = document.createElement('span');
    summaryLabel.textContent = 'Melhor carga registrada';
    const summaryValue = document.createElement('b');
    summaryValue.textContent = `${fmt(Math.max(...points.map(point => point.weight)))} kg`;
    summary.append(summaryLabel, summaryValue);
    box.append(heading, area, summary);
    plot('load', area, points.map(p => p.date), points.map(p => p.weight), 'kg', 'line', red, false);
  }

  function weeklyStats() {
    const today = new Date();
    const first = monday(today);
    const weeks = [];
    for (let index = 7; index >= 0; index--) {
      const start = new Date(first);
      start.setDate(start.getDate() - index * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const logs = db.logs.filter(log => {
        const date = new Date(log.date);
        return date >= start && date < end;
      });
      weeks.push({
        label: start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        frequency: logs.length,
        sets: logs.reduce((total, log) => total + (log.entries || [])
          .reduce((subtotal, entry) => subtotal + Math.max(0, Number(entry.setsDone) || 0), 0), 0)
      });
    }
    return weeks;
  }

  function renderExtraCharts() {
    const weeks = weeklyStats();
    const hasWorkout = db.logs.length > 0;
    plot('volume', document.getElementById('volumeChart'), weeks.map(w => w.label), hasWorkout ? weeks.map(w => w.sets) : [], 'séries');
    plot('frequency', document.getElementById('frequencyChart'), weeks.map(w => w.label), hasWorkout ? weeks.map(w => w.frequency) : [], 'treinos', 'bar');

    const measures = (db.measures || [])
      .filter(measure => Number(measure.weight) > 0 && Number.isFinite(new Date(measure.date).getTime()))
      .slice(-12);
    plot('body', document.getElementById('bodyChart'),
      measures.map(m => new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })),
      measures.map(m => Number(m.weight)), 'kg', 'line', green, false);
  }

  if (typeof originalDrawChart === 'function') window.drawChart = enhancedDrawChart;
  if (typeof originalRenderProgress === 'function') {
    window.renderProgress = function (...args) {
      const result = originalRenderProgress.apply(this, args);
      renderExtraCharts();
      return result;
    };
  }

  if (window.lucide?.createIcons) window.lucide.createIcons({ attrs: { 'stroke-width': 2.1 } });
  window.renderProgress?.();
})();
