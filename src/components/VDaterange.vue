<template>
    <div class="v-date-range">
        <v-menu
                v-model="menu"
                :close-on-content-click="false"
                offset-y
                v-bind="menuProps"
        >
            <template v-slot:activator="{ on }">
                <v-text-field
                        v-on="on"
                        class="v-date-range__input-field"
                        :value="inputValue"
                        readonly
                        :disabled="disabled"
                        :placeholder="placeholder"
                        v-bind="inputProps"
                ></v-text-field>
            </template>
            <v-card class="v-date-range__menu-content">
                <v-card-text>
                    <div
                            :data-days="highlightDates.length"
                            :class="{
              'v-date-range__pickers': true,
              'v-date-range--highlighted': highlightDates.length
            }"
                    >
                        <v-card-title v-if="$slots.title">
                            <slot name="title" v-if="$slots.title"></slot>
                        </v-card-title>
                        <v-card-text>
                            <div class="v-date-range__content">
                                <v-list v-if="!noPresets" class="mr-4">
                                    <v-subheader>{{ dict_lang.Presets }}</v-subheader>
                                    <v-list-item
                                            v-for="(preset, index) in presets"
                                            v-model="isPresetActive[index]"
                                            :key="index"
                                            @click="selectPreset(index)"
                                    >
                                        <v-list-item-content>
                                            {{ preset.label }}
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list>
                                <v-date-picker
                                        class="mr-4 v-date-range__picker--start v-date-range__picker"
                                        v-model="pickerStart"
                                        :locale="locale"
                                        :first-day-of-week="firstDayOfWeek"
                                        :min="min"
                                        :max="pickerEnd || max"
                                        :no-title="noTitle"
                                        :next-icon="nextIcon"
                                        :prev-icon="prevIcon"
                                        :events="highlightDates"
                                        :event-color="highlightClasses"
                                ></v-date-picker>
                                <v-date-picker
                                        class="v-date-range__picker--end v-date-range__picker"
                                        v-model="pickerEnd"
                                        :locale="locale"
                                        :first-day-of-week="firstDayOfWeek"
                                        :min="pickerStart || min"
                                        :max="max"
                                        :no-title="noTitle"
                                        :next-icon="nextIcon"
                                        :prev-icon="prevIcon"
                                        :events="highlightDates"
                                        :event-color="highlightClasses"
                                ></v-date-picker>
                            </div>
                        </v-card-text>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="reset">{{ dict_lang.Reset }}</v-btn>
                    <v-btn text @click="menu = false">{{ dict_lang.Cancel }}</v-btn>
                    <v-btn @click="applyRange" color="primary" :disabled="!bothSelected">{{ dict_lang.Apply }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-menu>
    </div>
</template>
<script>
    import {format, parse, differenceInCalendarDays, addDays} from 'date-fns';

    const isoFormat = 'YYYY-MM-DD';
    const defaultDate = format(new Date(), isoFormat);

    export default {
        name: 'v-daterange',
        props: {
            // Take start and end as the input. Passable via v-model.
            value: {
                type: Object,
                default: () => {
                    return {start: defaultDate, end: defaultDate};
                }
            },
            disabled: {
                type: Boolean,
                default: false
            },
            presets: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            noPresets: {
                type: Boolean,
                default: false
            },
            /**
             * Following values are all passable to vuetify's own datepicker
             * component.
             */
            // Min selectable date.
            min: {
                type: String,
                default: undefined
            },
            // Max selectable date
            max: {
                type: String,
                default: undefined
            },
            // Locale
            locale: {
                type: String,
                default: 'en-en'
            },
            firstDayOfWeek: {
                type: [String, Number],
                default: 0
            },
            noTitle: {
                type: Boolean,
                default: false
            },
            displayFormat: {
                type: String
            },
            highlightColor: {
                type: String,
                default: 'blue lighten-5'
            },
            showReset: {
                type: Boolean,
                default: true
            },
            /**
             * Icons
             */
            nextIcon: {
                type: String,
                default: '$vuetify.icons.next'
            },
            prevIcon: {
                type: String,
                default: '$vuetify.icons.prev'
            },
            inputProps: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            menuProps: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                menu: false,
                pickerStart: this.value.start,
                pickerEnd: this.value.end,
                highlightDates: [],
                highlightClasses: {},
                dict_lang: {}
            };
        },
        computed: {
            inputValue() {
                if (this.isValueEmpty) {
                    return '';
                }
                const start = this.displayFormat
                    ? this.formatDate(this.value.start, this.displayFormat)
                    : this.value.start;
                const end = this.displayFormat
                    ? this.formatDate(this.value.end, this.displayFormat)
                    : this.value.end;
                return `${start} ${this.dict_lang.To} ${end}`;
            },
            placeholder() {
                return `${this.dict_lang.StartDate} ${this.dict_lang.To} ${this.dict_lang.EndDate}`;
            },
            /**
             * If the value prop doesn't have any start value,
             * its most likely that an empty object was passed.
             */
            isValueEmpty() {
                return !this.value.start;
            },
            /**
             * If the user has selected both the dates or not
             */
            bothSelected() {
                return this.pickerStart && this.pickerEnd;
            },
            isPresetActive() {
                return this.presets.map(
                    preset =>
                        preset.range[0] === this.pickerStart &&
                        preset.range[1] === this.pickerEnd
                );
            },
        },
        methods: {
            /**
             * Emit the input event with the updated range data.
             * This makes v-model work.
             */
            applyRange() {
                this.menu = false;
                this.emitRange();
            },
            /**
             * Called every time the menu is closed.
             * It also emits an event to tell the parent
             * that the menu has closed.
             *
             * Upon closing the datepicker values are set
             * to the current selected value.
             */
            closeMenu() {
                // Reset the changed values for datepicker models.
                this.pickerStart = this.value.start;
                this.pickerEnd = this.value.end;
                this.highlight();
                this.$emit('menu-closed');
            },
            formatDate(date, fmt) {
                return format(parse(date), fmt);
            },
            highlight() {
                if (!this.bothSelected) {
                    return;
                }
                const dates = [];
                const classes = {};
                const start = parse(this.pickerStart);
                const end = parse(this.pickerEnd);
                const diff = Math.abs(differenceInCalendarDays(start, end));

                // Loop though all the days in range.
                for (let i = 0; i <= diff; i++) {
                    const date = format(addDays(start, i), isoFormat);
                    dates.push(date);
                    const classesArr = [];
                    classesArr.push(`v-date-range__in-range`);
                    classesArr.push(this.highlightColor);
                    i === 0 && classesArr.push(`v-date-range__range-start`);
                    i === diff && classesArr.push(`v-date-range__range-end`);
                    classes[date] = classesArr.join(' ');
                }
                this.highlightDates = dates;
                this.highlightClasses = classes;
            },
            selectPreset(presetIndex) {
                this.pickerStart = this.presets[presetIndex].range[0];
                this.pickerEnd = this.presets[presetIndex].range[1];
            },
            reset() {
                // Reset Picker Values
                this.pickerStart = '';
                this.pickerEnd = '';
                this.highlightDates = [];
                this.highlightClasses = {};
                this.emitRange();
            },
            emitRange() {
                this.$emit('input', {
                    start: this.pickerStart,
                    end: this.pickerEnd
                });
            },
            loadLocale() {
                try {
                    this.dict_lang = require('../locales/' + this.locale + '.json')
                } catch (e) {
                    console.log('I am not may loaded locale. fix it please')
                }
            }
        },
        mounted() {
            this.loadLocale();
        },
        watch: {
            // Watching to see if the menu is closed.
            menu(isOpen) {
                if (!isOpen) {
                    this.closeMenu();
                } else {
                    this.highlight();
                }
            },
            pickerStart: 'highlight',
            pickerEnd: 'highlight'
        }
    };
</script>
<style scoped lang="scss">
    .v-date-range__input-field > > > input {
        text-align: center;
    }

    /* =============================================
    =            Menu Content            =
    ============================================= */
    .v-date-range__content {
        display: flex;
    }

    .v-date-range__content > > > .v-date-picker-table .v-btn {
        border-radius: 0;
    }

    /* =====  End of Menu Content  ====== */
    .v-date-range__pickers > > > .v-date-picker-table__events {
        height: 100%;
        width: 100%;
        top: 0;
        z-index: -1;
    }

    /* =============================================
    =            Date buttons            =
    ============================================= */
    .v-date-range__pickers > > > .v-date-picker-table table {
        width: auto;
        margin: auto;
        border-collapse: collapse;
    }

    .v-date-range__pickers > > > .v-date-picker-table table th,
    .v-date-range__pickers > > > .v-date-picker-table table td {
        height: 32px;
        width: 32px;
    }

    .v-date-range__pickers > > > .v-date-picker-table table td .v-btn.v-btn--outline {
        border: none;
        box-shadow: 0 0 0 1px currentColor inset;
    }

    .v-date-range__pickers > > > .v-date-picker-table table td .v-btn.v-btn--active::before {
        background-color: transparent !important;
    }

    /* =====  End of Date buttons  ====== */
    /* =============================================
    =            Highlighting the even bubble dot            =
    ============================================= */
    .v-date-range__pickers > > > .v-date-range__in-range {
        height: 100%;
        width: 100%;
        margin: 0;
        border-radius: 0;
    }

    /* =====  End of Highlighting the even bubble dot  ====== */
</style>
