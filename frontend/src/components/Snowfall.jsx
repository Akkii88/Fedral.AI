import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const Snowfall = () => {
    const snowflakes = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            duration: Math.random() * 15 + 10,
            delay: Math.random() * 20,
            opacity: Math.random() * 0.3 + 0.1,
        }));
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {snowflakes.map((snowflake) => (
                <motion.div
                    key={snowflake.id}
                    initial={{ translateY: -20, opacity: 0 }}
                    animate={{
                        translateY: '110vh',
                        opacity: [0, snowflake.opacity, snowflake.opacity, 0],
                        translateX: [0, Math.random() * 50 - 25, 0]
                    }}
                    transition={{
                        duration: snowflake.duration,
                        repeat: Infinity,
                        delay: snowflake.delay,
                        ease: "linear"
                    }}
                    style={{
                        position: 'absolute',
                        left: snowflake.left,
                        width: snowflake.size,
                        height: snowflake.size,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        filter: 'blur(1px)',
                    }}
                />
            ))}
        </div>
    );
};

export default Snowfall;
