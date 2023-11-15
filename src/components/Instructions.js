import React, { Component } from 'react'

class Instructions extends Component {
    render() {
        const { children, fRef } = this.props;
        return (
            <h2 ref={fRef} className="instructions">
                {children}
            </h2>
        )
    }
}

export default React.forwardRef((props, ref) => <Instructions {...props} fRef={ref} />)