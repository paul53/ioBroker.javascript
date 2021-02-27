import React from 'react';
import CardMenu from '.';
import { deepCopy } from '../../helpers/deepCopy';
import DragWrapper from '../DragWrapper';
import {STEPS} from '../../helpers/Tour';


const CustomDragItem = props => {
    const { allProperties, allProperties: { acceptedBy, id }, setUserRules, userRules, setTourStep, tourStep, isTourOpen } = props;
    return <DragWrapper {...props} {...allProperties}>
        <CardMenu onDoubleClick={() => {
            (isTourOpen && tourStep === STEPS.addScheduleByDoubleClick) && setTourStep(STEPS.addOnSaveTriggerByDragAndDrop);

            let _id = Date.now();
            let blockValue;
            switch (acceptedBy) {
                case 'actions':
                    blockValue = 'then';
                    break;

                case 'conditions':
                    blockValue = userRules[acceptedBy].length - 1;
                    break;

                default:
                    break;
            }
            let newUserRules = deepCopy(acceptedBy, userRules, blockValue);
            const newItem = { id, _id, acceptedBy };


            if (blockValue !== undefined) {
                newUserRules[acceptedBy][blockValue].push({ ...newItem });
            } else {
                newUserRules[acceptedBy].push({ ...newItem });
            }
            setUserRules(newUserRules);
        }} onDoubl {...props} {...allProperties} />
    </DragWrapper>;
}

export default CustomDragItem;