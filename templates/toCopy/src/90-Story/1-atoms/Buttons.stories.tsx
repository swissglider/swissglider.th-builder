import React, { useEffect } from 'react';
import { Title, Subtitle, Description, Primary, ArgsTable, PRIMARY_STORY } from '@storybook/addon-docs';
import Button from '../../1-atoms/Buton';

export default {
    title: 'Internal/1-Atoms/Button',
    argTypes: {},
    args: {},
    parameters: {
        controls: { hideNoControlsWarning: true },
        docs: {
            page: () => {
                return (
                    <>
                        <Title />
                        <Subtitle />
                        <Description />
                        <Primary />
                        <ArgsTable story={PRIMARY_STORY} />
                    </>
                );
            },
            description: {
                component: 'DefaultComponent',
            },
        },
    },
};

const DefaultComponentTemplate: any = () => {
    return (
        <div className="flex flex-wrap">
            <div className="w-full p-3 md:w-1/2 xl:w-1/3 2xl:w-1/4">
                <Button />
                <Button />
                <Button />
            </div>
        </div>
    );
};

export const DefaultComponent = DefaultComponentTemplate.bind({});
DefaultComponent.args = {};
