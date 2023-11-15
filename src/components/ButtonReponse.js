import React, { Component } from 'react'

class ButtonReponse extends Component {
    render() {
        const { label, isPositive, isHighlighted, isDisabled, fRef } = this.props;

        // Button defaults to wrong state
        let classname = 'button-response';
        classname += isPositive ? ' button-response--correct ' : ' button-response--wrong';
        classname += isHighlighted ? ' button-response--highlight' : '';

        return (
            <button ref={fRef} className={classname} disabled={isDisabled}>
                {label}
            </button>
        )
    }
}


export default React.forwardRef((props, ref) => <ButtonReponse {...props} fRef={ref} />)