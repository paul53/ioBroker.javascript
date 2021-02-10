import React, { Fragment, useEffect, useState } from 'react';
import cls from './style.module.scss';
///////
import FlashOnIcon from '@material-ui/icons/FlashOn';
import HelpIcon from '@material-ui/icons/Help';
import PlayForWorkIcon from '@material-ui/icons/PlayForWork';
//////
import CustomInput from './components/CustomInput';
import { CustomDragLayer } from './components/CustomDragLayer';
import CustomDragItem from './components/CardMenu/CustomDragItem';
import ContentBlockItems from './components/ContentBlockItems';
import HamburgerMenu from './components/HamburgerMenu';
import { useStateLocal } from './hooks/useStateLocal';
import { AppBar, Tab, Tabs } from '@material-ui/core';
// import PropTypes from 'prop-types';

const STANDARD_FUNCTION = `async function (obj) {
    if (__%%CONDITION%%__) {
__%%THEN%%__
    } else {
__%%ELSE%%__
    }
}`

// import I18n from '@iobroker/adapter-react/i18n';
// import DialogMessage from '@iobroker/adapter-react/Dialogs/Message';
const allSwitches = [
    {
        name: 'Trigger2',
        typeBlock: 'when',
        icon:'AccessTime',
        // acceptedOn: ['when'],
        type: 'trigger',
        compile: (config, context) => `schedule('* 1 * * *', ${STANDARD_FUNCTION});`,
        getConfig: () => { },
        setConfig: (config) => { },
        _acceptedBy: 'triggers', // where it could be acceped: trigger, condition, action
        _type: 'trigger1',
        _name: { en: 'Schedule', ru: 'Триггер' },
        _inputs: { nameRender: 'renderTimeOfDay', name: { en: 'Object ID' }, attr: 'objectID', type: 'oid', default: '', icon: '' },
    },{
        name: 'Trigger3',
        typeBlock: 'when',
        icon:'PlayArrow',
        // acceptedOn: ['when'],
        type: 'trigger',
        compile: (config, context) => `schedule('* 1 * * *', ${STANDARD_FUNCTION});`,
        getConfig: () => { },
        setConfig: (config) => { },
        _acceptedBy: 'triggers', // where it could be acceped: trigger, condition, action
        _type: 'trigger1',
        _name: { en: 'Script save', ru: 'Триггер' },
        _inputs: 
            { nameRender: 'renderOnScript', name: { en: 'Object ID' }, attr: 'objectID', type: 'oid', default: '', icon: '' },
    },
    {
        name: 'Trigger1',
        typeBlock: 'when',
        icon:'FlashOn',
        // acceptedOn: ['when'],
        type: 'trigger',
        compile: (config, context) => `schedule('* 1 * * *', ${STANDARD_FUNCTION});`,
        getConfig: () => { },
        setConfig: (config) => { },
        _acceptedBy: 'triggers', // where it could be acceped: trigger, condition, action
        _type: 'trigger1',
        _name: { en: 'State', ru: 'Триггер' },
        _inputs: 
            { nameRender: 'renderState', name: { en: 'Object ID' }, attr: 'objectID', type: 'oid', default: '', icon: '' },
    },
    {
        name: 'Condition1',
        getConfig: () => { },
        setConfig: (config) => { },
        _acceptedBy: 'conditions', // where it could be acceped: trigger, condition, action
        _type: 'condition1',
        _name: { en: 'Condition', ru: 'Триггер' },
        typeBlock: 'and',
        icon:'Shuffle',
        type: 'condition',
        compile: (config, context) => `obj.val === "1"`,
        _inputs: 
            { nameRender: 'renderText', name: { en: 'Object ID' }, attr: 'objectID', type: 'oid', default: '', icon: '' },
    },
    {
        name: 'Action1',
        typeBlock: 'then',
        icon:'PlaylistPlay',

        // acceptedOn: ['then', 'else'],
        type: 'action',
        compile: (config, context) => `setState('id', obj.val);`,
        getConfig: () => { },
        setConfig: (config) => { },
        _acceptedBy: 'actions', // where it could be acceped: trigger, condition, action
        _type: 'action1',
        _name: { en: 'Action', ru: 'Действие' },
        _inputs: 
            { nameRender: 'renderText', name: { en: 'Object ID' }, attr: 'objectID', type: 'oid', default: '', icon: '' },
    }
];

// eslint-disable-next-line no-unused-vars
const DEFAULT_RULE = {
    triggers: [],
    conditions: [[]],
    actions: {
        then: [],
        'else': []
    }
};

function compileTriggers(json, context) {
    const triggers = [];
    json.triggers.forEach(trigger => {
        const found = findBlock(trigger.id);
        if (found) {
            const text = found.compile(trigger, context);
            const conditions = compileConditions(json.conditions, context);
            const then = compileActions(json.actions.then, context);
            const _else = compileActions(json.actions.else, context);
            triggers.push(
                text
                    .replace('__%%CONDITION%%__', conditions)
                    .replace('__%%THEN%%__', then || '// ignore')
                    .replace('__%%ELSE%%__', _else || '// ignore')
            );
        }
    });

    return triggers.join('\n\n');
}
function findBlock(type) {
    return allSwitches.find(block => block.name === type);
}

function compileActions(actions, context) {
    let result = [];
    actions && actions.forEach(action => {
        const found = findBlock(action.id);
        if (found) {
            result.push(found.compile(action, context));
        }
    });
    return `\t\t${result.join('\t\t\n')}` || '';
}

function compileConditions(conditions, context) {
    let result = [];
    conditions && conditions.forEach(ors => {
        if (ors.hasOwnProperty('length')) {
            const _ors = [];
            _ors && ors.forEach(block => {
                const found = findBlock(block.id);
                if (found) {
                    _ors.push(found.compile(block, context));
                }
            });
            result.push(_ors.join(' || '));
        } else {
            const found = findBlock(ors.id);
            if (found) {
                result.push(found.compile(ors, context));
            }
        }

    });
    return (result.join(') && (') || 'true');
}

function compile(json) {
    return compileTriggers(json);
}

// eslint-disable-next-line no-unused-vars
function code2json(code) {
    if (!code) {
        return DEFAULT_RULE;
    } else {
        const lines = code.split('\n');
        try {
            let json = lines.pop().replace(/^\/\//, '');
            json = JSON.parse(json);
            if (!json.triggers) {
                json = DEFAULT_RULE;
            }
            return json;
        } catch (e) {
            return DEFAULT_RULE;
        }
    }
}

// eslint-disable-next-line no-unused-vars
function json2code(json) {
    let code = `const demo = ${JSON.stringify(json, null, 2)};\n`;

    const compiled = compile(json);
    code += compiled;

    return code + '\n//' + JSON.stringify(json);
}

const RulesEditor = props => {
    // eslint-disable-next-line no-unused-vars
    const [switches, setSwitches] = useState([]);
    const [hamburgerOnOff, setHamburgerOnOff] = useStateLocal(false, 'hamburgerOnOff');
    const [itemsSwitches, setItemsSwitches] = useState(code2json(props.code)); //useStateLocal(DEFAULT_RULE, 'itemsSwitches');
    const [filter, setFilter] = useStateLocal({
        text: '',
        type: 'trigger',
        index: 0
    }, 'filterControlPanel');

    const setSwitchesFunc = (text = filter.text, typeFunc = filter.type) => {
        let newAllSwitches = [...allSwitches];
        newAllSwitches = newAllSwitches.filter(({ type, _name }) => _name.en.toLowerCase().indexOf(text.toLowerCase()) + 1);
        newAllSwitches = newAllSwitches.filter(({ type, _name }) => typeFunc === type);
        console.log(newAllSwitches);
        setSwitches(newAllSwitches);
    };

    useEffect(() => {
        setSwitchesFunc();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const a11yProps = index => ({
        id: `scrollable-force-tab-${index}`,
        'aria-controls': `scrollable-force-tabpanel-${index}`
    });

    const handleChange = (event, newValue) => {
        setFilter({
            ...filter,
            index: newValue,
            type: ['trigger', 'condition', 'action'][newValue]
        });
        setSwitchesFunc(filter.text, ['trigger', 'condition', 'action'][newValue]);
    };

    return <div className={cls.wrapperRules}>
        <CustomDragLayer />
        <div className={`${cls.hamburgerWrapper} ${hamburgerOnOff ? cls.hamburgerOff : null}`}
            onClick={() => setHamburgerOnOff(!hamburgerOnOff)}><HamburgerMenu boolean={!hamburgerOnOff} /></div>
        <div className={`${cls.menuRules} ${hamburgerOnOff ? cls.menuOff : null}`}>
            <CustomInput
                className={cls.inputWidth}
                fullWidth
                customValue
                value={filter.text}
                autoComplete="off"
                label="search"
                variant="outlined"
                onChange={(value) => {
                    setFilter({ ...filter, text: value });
                    setSwitchesFunc(value);
                }}
            />
            <div className={cls.menuTitle}>
                Control Panel
            </div>
            <div className={cls.controlPanel}>
                <AppBar className={cls.controlPanelAppBar} position="static">
                    <Tabs
                        value={filter.index}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        aria-label="scrollable force tabs example"
                    >
                        <Tab icon={<FlashOnIcon />} {...a11yProps(0)} />
                        <Tab icon={<HelpIcon />} {...a11yProps(1)} />
                        <Tab icon={<PlayForWorkIcon />} {...a11yProps(2)} />
                    </Tabs>
                </AppBar>
            </div>
            <div className={cls.menuTitle}>
                Switches
                </div>
            <div className={cls.switchesRenderWrapper}>
                <span>
                    {switches.map(el =>
                        <Fragment key={el._name.en}>
                            <CustomDragItem
                                {...el}
                                itemsSwitches={itemsSwitches}
                                setItemsSwitches={json => {
                                    setItemsSwitches(json);
                                    props.onChange(json2code(json));
                                }}
                                isActive={false}
                                id={el.name}
                                allProperties={el}
                            />
                        </Fragment>)}
                    {switches.length === 0 && <div className={cls.nothingFound}>
                        Nothing found...
                            <div className={cls.resetSearch} onClick={() => {
                            setFilter({
                                ...filter,
                                text: ''
                            });
                            setSwitchesFunc('');
                        }}>reset search</div>
                    </div>}
                </span>
            </div>
        </div>

        <ContentBlockItems
            setItemsSwitches={json => {
                // const _itemsSwitches = JSON.parse(JSON.stringify(itemsSwitches));
                // _itemsSwitches.triggers = json;
                setItemsSwitches(json);
                props.onChange(json2code(json));
            }}
            itemsSwitches={itemsSwitches}
            name="when..."
            typeBlock="triggers"
        />
        <ContentBlockItems
            setItemsSwitches={json => {
                setItemsSwitches(json);
                props.onChange(json2code(json));
            }}
            itemsSwitches={itemsSwitches}
            name="...and..."
            typeBlock="conditions"
            nameAdditionally="or"
            additionally
            border
        />
        <ContentBlockItems
            setItemsSwitches={json => {
                setItemsSwitches(json);
                props.onChange(json2code(json));
            }}
            itemsSwitches={itemsSwitches}
            name="...then"
            typeBlock="actions"
            nameAdditionally="else"
            additionally
        />
    </div>;
}

// RulesEditor.propTypes = {

// };

export default RulesEditor;
