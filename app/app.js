/* global AFRAME, THREE */

// app.js is the main entry point for your 8th Wall app. Code here will execute after head.html
// is loaded, and before body.html is loaded.

import {compassComponent} from './components/compass.js'

AFRAME.registerComponent('compass', compassComponent)
// Check Location Permissions at beginning of session
const errorCallback = (error) => {
    if (error.code === error.PERMISSION_DENIED) {
        alert('LOCATION PERMISSIONS DENIED. PLEASE ALLOW AND TRY AGAIN.')
    }
}
navigator.geolocation.getCurrentPosition((pos) => {
    // intentionally empty. Awaiting implementation of position handling.
}, errorCallback)

import {handleScreenUIComponent} from "./components/handle-ui.js";

AFRAME.registerComponent("handle-ui", handleScreenUIComponent);

import {getDataComponent} from "./components/get-data.js";

AFRAME.registerComponent("get-data", getDataComponent);

// bitmaps cause texture issues on iOS this workaround prevents black textures and crashes
const IS_IOS =
    /^(iPad|iPhone|iPod)/.test(window.navigator.platform) ||
    (/^Mac/.test(window.navigator.platform) &&
        window.navigator.maxTouchPoints > 1);
if (IS_IOS) {
    window.createImageBitmap = undefined;
}

// prevent culling component
AFRAME.registerComponent('no-cull', {
    init() {
        this.el.addEventListener('model-loaded', () => {
            this.el.object3D.traverse(obj => obj.frustumCulled = false)
        })
    },
})

// rounded component
AFRAME.registerComponent('rounded', {
    schema: {
        enabled: {default: true},
        width: {type: 'number', default: 1},
        height: {type: 'number', default: 1},
        radius: {type: 'number', default: 0.3},
        topLeftRadius: {type: 'number', default: -1},
        topRightRadius: {type: 'number', default: -1},
        bottomLeftRadius: {type: 'number', default: -1},
        bottomRightRadius: {type: 'number', default: -1},
        color: {type: 'color', default: '#F0F0F0'},
        opacity: {type: 'number', default: 1},
    },
    init() {
        this.rounded = new THREE.Mesh(
            this.draw(),
            new THREE.MeshPhongMaterial({
                color: new THREE.Color(this.data.color),
                side: THREE.DoubleSide,
            })
        )
        this.updateOpacity()
        this.el.setObject3D('mesh', this.rounded)
    },
    update() {
        if (this.data.enabled) {
            if (this.rounded) {
                this.rounded.visible = true
                this.rounded.geometry = this.draw()
                this.rounded.material.color = new THREE.Color(this.data.color)
                this.updateOpacity()
            }
        } else {
            this.rounded.visible = false
        }
    },
    updateOpacity() {
        if (this.data.opacity < 0) {
            this.data.opacity = 0
        }
        if (this.data.opacity > 1) {
            this.data.opacity = 1
        }
        if (this.data.opacity < 1) {
            this.rounded.material.transparent = true
        } else {
            this.rounded.material.transparent = false
        }
        this.rounded.material.opacity = this.data.opacity
    },
    remove() {
        if (!this.rounded) {
            return
        }
        this.el.object3D.remove(this.rounded)
        this.rounded = null
    },
    draw() {
        const roundedRectShape = new THREE.Shape()

        /*
         * Draws a rounded rectangle on a canvas context.
         * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
         * @param {number} x - The X coordinate of the rectangle's top left corner.
         * @param {number} y - The Y coordinate of the rectangle's top left corner.
         * @param {number} width - The width of the rectangle.
         * @param {number} height - The height of the rectangle.
         * @param {number} topLeftRadius - The radius of the top left corner.
         * @param {number} topRightRadius - The radius of the top right corner.
         * @param {number} bottomLeftRadius - The radius of the bottom left corner.
         * @param {number} bottomRightRradius - The radius of the bottom right corner.
         */
        function roundedRect(
            ctx,
            x,
            y,
            width,
            height,
            topLeftRadius,
            topRightRadius,
            bottomLeftRadius,
            bottomRightRadius
        ) {
            if (!topLeftRadius) {
                topLeftRadius = 0.00001
            }
            if (!topRightRadius) {
                topRightRadius = 0.00001
            }
            if (!bottomLeftRadius) {
                bottomLeftRadius = 0.00001
            }
            if (!bottomRightRadius) {
                bottomRightRadius = 0.00001
            }
            ctx.moveTo(x, y + topLeftRadius)
            ctx.lineTo(x, y + height - topLeftRadius)
            ctx.quadraticCurveTo(x, y + height, x + topLeftRadius, y + height)
            ctx.lineTo(x + width - topRightRadius, y + height)
            ctx.quadraticCurveTo(
                x + width,
                y + height,
                x + width,
                y + height - topRightRadius
            )
            ctx.lineTo(x + width, y + bottomRightRadius)
            ctx.quadraticCurveTo(x + width, y, x + width - bottomRightRadius, y)
            ctx.lineTo(x + bottomLeftRadius, y)
            ctx.quadraticCurveTo(x, y, x, y + bottomLeftRadius)
        }

        const corners = [
            this.data.radius,
            this.data.radius,
            this.data.radius,
            this.data.radius,
        ]
        if (this.data.topLeftRadius !== -1) {
            corners[0] = this.data.topLeftRadius
        }
        if (this.data.topRightRadius !== -1) {
            corners[1] = this.data.topRightRadius
        }
        if (this.data.bottomLeftRadius !== -1) {
            corners[2] = this.data.bottomLeftRadius
        }
        if (this.data.bottomRightRadius !== -1) {
            corners[3] = this.data.bottomRightRadius
        }

        roundedRect(
            roundedRectShape,
            0,
            0,
            this.data.width,
            this.data.height,
            corners[0],
            corners[1],
            corners[2],
            corners[3]
        )
        return new THREE.ShapeBufferGeometry(roundedRectShape)
    },
})

AFRAME.registerPrimitive('a-rounded', {
    defaultComponents: {
        rounded: {},
    },
    mappings: {
        'enabled': 'rounded.enabled',
        'width': 'rounded.width',
        'height': 'rounded.height',
        'radius': 'rounded.radius',
        'top-left-radius': 'rounded.topLeftRadius',
        'top-right-radius': 'rounded.topRightRadius',
        'bottom-left-radius': 'rounded.bottomLeftRadius',
        'bottom-right-radius': 'rounded.bottomRightRadius',
        'color': 'rounded.color',
        'opacity': 'rounded.opacity',
    },
})
