import Calculator from './components/Calculator';

function App() {
    return (
        <>
            <div className="bg-shapes">
                <div className="shape shape-1" />
                <div className="shape shape-2" />
                <div className="shape shape-3" />
                <div className="shape shape-4" />
                <div className="shape shape-5" />
            </div>
            <div className="particles">
                {Array.from({ length: 20 }).map((_, i) => (
                    <span
                        key={i}
                        className="particle"
                        style={{
                            '--x': `${Math.random() * 100}%`,
                            '--y': `${Math.random() * 100}%`,
                            '--size': `${2 + Math.random() * 4}px`,
                            '--delay': `${Math.random() * 8}s`,
                            '--duration': `${6 + Math.random() * 10}s`,
                        }}
                    />
                ))}
            </div>
            <Calculator />
        </>
    );
}

export default App;
