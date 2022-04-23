import React, { FC, useEffect } from 'react';
import { useDefaultHooks } from '../../10-addons/hooks/useDefaultHook';

const DefaultComponent: FC<any> = () => {
    useDefaultHooks();

    useEffect(() => {
        console.log('DefaultComponent');
    }, []);
    return (
        <div>
            <button>Hallo Guido</button>
        </div>
    );
};

export default DefaultComponent;
