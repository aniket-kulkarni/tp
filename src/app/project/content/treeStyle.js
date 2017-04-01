module.exports = {
    tree: {
        base: {
            listStyle: 'none',
            backgroundColor: '#E6E6EB',
            margin: 0,
            padding: 0,
            color: '#9DA5AB',
            fontFamily: 'Source Sans Pro,Lucida Grande,Verdana, sans',
            fontSize: '12px',
            marginLeft : '5px'
        },
        node: {
            base: {
                position: 'relative'
            },
            link: {
                cursor: 'pointer',
                position: 'relative',
                padding: '4px 5px',
                marginRight: '3px',
                display: 'block'
            },
            activeLink: {
                background: '#CAEDF7',
                boxShadow: 'inset 0 0 0 1px rgba(0,125,153,0.4), inset 0px 0px 5px rgba(0,125,153,0.7),0 1px 0 rgba(255,255,255,0.4)'
            },
            toggle: {
                base: {
                    position: 'relative',
                    display: 'inline-block',
                    verticalAlign: 'top',
                    marginLeft: '-5px',
                    height: '24px',
                    width: '24px'
                },
                wrapper: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    margin: '-7px 0 0 -7px',
                    height: '14px'
                },
                height: 10,
                width: 10,
                arrow: {
                    fill: 'rgba(0,0,0,0.35)',
                    strokeWidth: 0
                }
            },
            header: {
                base: {
                    display: 'inline-block',
                    verticalAlign: 'top',
                    color: 'black'
                },
                connector: {
                    width: '2px',
                    height: '12px',
                    borderLeft: 'solid 2px black',
                    borderBottom: 'solid 2px black',
                    position: 'absolute',
                    top: '0px',
                    left: '-21px'
                },
                title: {
                    lineHeight: '24px',
                    verticalAlign: 'middle'
                }
            },
            subtree: {
                listStyle: 'none',
                paddingLeft: '19px'
            },
            loading: {
                color: '#E2C089'
            }
        }
    }
};