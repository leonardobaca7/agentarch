/**
 * Agente Sintético: InventoryAgent
 * Responsabilidad: Verificar stock en bodega y reservar unidades.
 */

class InventoryAgent {
    constructor(spec, options = {}) {
        this.id = 'InventoryAgent';
        this.role = 'InventoryAgent';
        this.spec = spec;
        this.isMock = options.isMock !== false;
    }

    getPromptClauses() {
        return {
            ids: ['clause_inventory_lock'],
            hashes: [
                this.spec.P.InventoryAgent.hashes.clause_inventory_lock
            ]
        };
    }

    handleAction(sku, quantity) {
        return {
            verify: { tool: 'verify_inventory', args: { sku, quantity } },
            reserve: { tool: 'reserve_stock', args: { sku, quantity } }
        };
    }
}

module.exports = { InventoryAgent };
