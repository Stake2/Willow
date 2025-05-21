print('[Bernie] Inventory-Backpacks-Module was loaded!')

local GLOBAL = GLOBAL or _G
local backpackprefabs = { "backpack", "piggyback", "krampus_sack", "icepack", "seedpouch", "spicepack", "candybag" }

local function OnEquipItem(inst, data)
    if not (data and data.item) then return end
    if not data.item:HasTag("backpack") then return end
    for _, item in pairs(inst.components.inventory.itemslots) do
        if item and item:HasTag("backpack") then inst.components.inventory:DropItem(item, true, true) end
    end
    local activeItem = inst.components.inventory.activeitem
    if activeItem and activeItem:HasTag("backpack") then inst.components.inventory:DropItem(activeItem, true, true) end
end

local function OnItemGet(inst, data)
    if not (data.item and data.item:HasTag("backpack")) then return end
    ---@diagnostic disable-next-line: undefined-field
    local equippedBackpack = inst.components.inventory:GetEquippedItem(GLOBAL.EQUIPSLOTS.BODY)
    if equippedBackpack and not equippedBackpack:HasTag("backpack") then equippedBackpack = nil end
    if equippedBackpack and data.item then
        inst.components.inventory:DropItem(equippedBackpack, true, true)
        inst.components.inventory:Equip(data.item)
    end
    local backpackCount = 0
    for _, item in pairs(inst.components.inventory.itemslots) do
        if item and item:HasTag("backpack") then
            if backpackCount >= 1 or equippedBackpack then inst.components.inventory:DropItem(item, true, true) end
            backpackCount = backpackCount + 1
        end
    end
end

local function ChangePrefab(inst)
    if not inst.components.inventoryitem then inst:AddComponent("inventoryitem") end
    inst.components.inventoryitem.cangoincontainer = true
    inst.components.inventoryitem:SetOnPutInInventoryFn(function(inst, owner)
        if not (owner and owner.components.container and owner ~= inst.components.inventory) then return end
        inst:DoTaskInTime(0, function()
            local slot = owner.components.container:GetItemSlot(inst)
            owner.components.container:DropItem(inst, true, true)
        end)
    end)
end

local function OnPlayerDamaged(inst, data)
    if not (data.damage and data.damage > 6) then return end
    if not math.random() <= 0.3 then return end
    for _, item in pairs(inst.components.inventory.itemslots) do
        if item and item:HasTag("backpack") then
            inst.components.inventory:DropItem(item, true, true)
            if inst.SoundEmitter then
                inst.SoundEmitter:PlaySound("yotb_2021/common/hitching_post/unhitching")
            end
            break
        end
    end
    local activeItem = inst.components.inventory.activeitem
    if activeItem and activeItem:HasTag("backpack") then inst.components.inventory:DropItem(activeItem, true, true) end
end

AddSimPostInit(function()
    AddPlayerPostInit(function(inst)
        inst:ListenForEvent("itemget", OnItemGet)
        inst:ListenForEvent("equip", OnEquipItem)
        inst:ListenForEvent("attacked", OnPlayerDamaged)
    end)
end)

for _, prefab in ipairs(backpackprefabs) do
    AddPrefabPostInit(prefab, ChangePrefab)
end
