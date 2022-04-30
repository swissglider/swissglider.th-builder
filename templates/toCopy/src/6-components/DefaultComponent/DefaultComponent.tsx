import React, { FC, useEffect } from 'react';
import Button from '../../1-atoms/Buton';
import { useDefaultHooks } from '../../10-addons/hooks/useDefaultHook';

const DefaultComponent: FC<any> = () => {
    useDefaultHooks();

    useEffect(() => {
        console.log('DefaultComponent');
    }, []);
    return (
        <div>
            <Button>Hallo Guido</Button>
        </div>
    );
};

export default DefaultComponent;
