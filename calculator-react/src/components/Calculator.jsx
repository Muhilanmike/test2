import { useState, useCallback, useEffect } from 'react';
import './Calculator.css';

const BUTTONS = [
    { label: 'AC', type: 'clear', action: 'clear' },
    { label: '+/−', type: 'operator', action: 'toggle' },
    { label: '%', type: 'operator', action: 'percent' },
    { label: '÷', type: 'accent', action: 'op', value: '/' },
    { label: '7', type: 'number', action: 'num', value: '7' },
    { label: '8', type: 'number', action: 'num', value: '8' },
    { label: '9', type: 'number', action: 'num', value: '9' },
    { label: '×', type: 'accent', action: 'op', value: '*' },
    { label: '4', type: 'number', action: 'num', value: '4' },
    { label: '5', type: 'number', action: 'num', value: '5' },
    { label: '6', type: 'number', action: 'num', value: '6' },
    { label: '−', type: 'accent', action: 'op', value: '-' },
    { label: '1', type: 'number', action: 'num', value: '1' },
    { label: '2', type: 'number', action: 'num', value: '2' },
    { label: '3', type: 'number', action: 'num', value: '3' },
    { label: '+', type: 'accent', action: 'op', value: '+' },
    { label: '0', type: 'number zero', action: 'num', value: '0' },
    { label: '.', type: 'number', action: 'decimal' },
    { label: '=', type: 'equals', action: 'equals' },
];

const OP_MAP = { '+': '+', '-': '−', '*': '×', '/': '÷' };

export default function Calculator() {
    const [current, setCurrent] = useState('0');
    const [previous, setPrevious] = useState('');
    const [operator, setOperator] = useState(null);
    const [shouldReset, setShouldReset] = useState(false);
    const [expression, setExpression] = useState('');
    const [flash, setFlash] = useState(false);
    const [history, setHistory] = useState([]);

    /* ---- helpers ---- */
    const appendNumber = useCallback((val) => {
        setCurrent(prev => {
            if (prev === '0' || shouldReset) { setShouldReset(false); return val; }
            if (prev.length >= 15) return prev;
            return prev + val;
        });
    }, [shouldReset]);

    const appendDecimal = useCallback(() => {
        if (shouldReset) { setCurrent('0.'); setShouldReset(false); return; }
        setCurrent(prev => prev.includes('.') ? prev : prev + '.');
    }, [shouldReset]);

    const doCalc = useCallback((a, b, op) => {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return b === 0 ? 'Error' : a / b;
            default: return b;
        }
    }, []);

    const calculate = useCallback(() => {
        if (!operator || shouldReset) return;
        const prev = parseFloat(previous);
        const curr = parseFloat(current);
        const raw = doCalc(prev, curr, operator);
        const result = raw === 'Error' ? 'Error' : parseFloat(Number(raw).toFixed(10)).toString();

        setExpression(`${previous} ${OP_MAP[operator]} ${curr}`);
        setHistory(h => [{ expr: `${previous} ${OP_MAP[operator]} ${curr}`, result }, ...h].slice(0, 5));
        setCurrent(result);
        setOperator(null);
        setPrevious('');
        setShouldReset(true);
        setFlash(true);
        setTimeout(() => setFlash(false), 400);
    }, [operator, shouldReset, previous, current, doCalc]);

    const appendOperator = useCallback((op) => {
        if (operator && !shouldReset) calculate();
        setPrevious(current);
        setOperator(op);
        setShouldReset(true);
        setExpression(`${current} ${OP_MAP[op]}`);
    }, [current, operator, shouldReset, calculate]);

    const clearAll = useCallback(() => {
        setCurrent('0');
        setPrevious('');
        setOperator(null);
        setShouldReset(false);
        setExpression('');
    }, []);

    const toggleSign = useCallback(() => {
        setCurrent(prev => {
            if (prev === '0' || prev === 'Error') return prev;
            return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
        });
    }, []);

    const percent = useCallback(() => {
        setCurrent(prev => prev === 'Error' ? prev : (parseFloat(prev) / 100).toString());
    }, []);

    const handleBackspace = useCallback(() => {
        setCurrent(prev => prev.length > 1 && prev !== 'Error' ? prev.slice(0, -1) : '0');
    }, []);

    /* ---- Button handler ---- */
    const handleBtn = useCallback((btn) => {
        switch (btn.action) {
            case 'num': appendNumber(btn.value); break;
            case 'decimal': appendDecimal(); break;
            case 'op': appendOperator(btn.value); break;
            case 'equals': calculate(); break;
            case 'clear': clearAll(); break;
            case 'toggle': toggleSign(); break;
            case 'percent': percent(); break;
        }
    }, [appendNumber, appendDecimal, appendOperator, calculate, clearAll, toggleSign, percent]);

    /* ---- Keyboard ---- */
    useEffect(() => {
        const onKey = (e) => {
            if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
            else if (e.key === '.') appendDecimal();
            else if (e.key === '+') appendOperator('+');
            else if (e.key === '-') appendOperator('-');
            else if (e.key === '*') appendOperator('*');
            else if (e.key === '/') { e.preventDefault(); appendOperator('/'); }
            else if (e.key === 'Enter' || e.key === '=') calculate();
            else if (e.key === 'Escape') clearAll();
            else if (e.key === 'Backspace') handleBackspace();
            else if (e.key === '%') percent();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [appendNumber, appendDecimal, appendOperator, calculate, clearAll, handleBackspace, percent]);

    /* ---- Dynamic font size ---- */
    const fontSize = current.length > 12 ? '1.8rem' : current.length > 9 ? '2.4rem' : undefined;

    return (
        <div className="calc-wrapper">
            {/* Mini history panel */}
            {history.length > 0 && (
                <div className="history-panel">
                    <div className="history-title">History</div>
                    {history.map((h, i) => (
                        <div key={i} className="history-item" onClick={() => { setCurrent(h.result); setShouldReset(true); }}>
                            <span className="history-expr">{h.expr}</span>
                            <span className="history-res">= {h.result}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="calculator">
                <div className="display">
                    <div className="expression">{expression}</div>
                    <div className={`result ${flash ? 'flash' : ''}`} style={{ fontSize }}>
                        {current}
                    </div>
                </div>

                <div className="buttons">
                    {BUTTONS.map((btn, i) => (
                        <button
                            key={i}
                            className={`btn btn-${btn.type}`}
                            onClick={() => handleBtn(btn)}
                        >
                            <span className="btn-label">{btn.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
