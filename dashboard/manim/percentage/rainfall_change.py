"""A short Manim Slides deck for a sequential percentage-change example.

Render from dashboard/:
    .\render.ps1 -SceneFile manim\percentage\rainfall_change.py `
        -SceneName RainfallChange -Deck percentage\rainfall-change -Quality m
"""
from __future__ import annotations

import pathlib
import sys

from manim import *

sys.path.append(str(pathlib.Path(__file__).resolve().parent))
from pct_common import BG, DROP, FACTOR, GOLD, GROW, INK, MUTED, NEW, OLD, PctSlide


class RainfallChange(PctSlide):
    """Introduce change factors, then solve the supplied rainfall example."""

    def construct(self):
        self.camera.background_color = BG
        self.title_bar("Percentage Change: Rainfall")
        self.next_slide()

        # Slide 1: concept
        new_value = Tex("New value", color=NEW, font_size=48)
        equals = MathTex("=", color=INK, font_size=52)
        old_value = Tex("Old value", color=OLD, font_size=48)
        times = MathTex(r"\times", color=INK, font_size=52)
        factor = Tex("Change factor", color=FACTOR, font_size=48)
        relation = VGroup(new_value, equals, old_value, times, factor).arrange(
            RIGHT, buff=0.28
        ).move_to([0, 0.5, 0])
        meaning = Tex(
            "A percentage change is a multiplication.",
            color=MUTED,
            font_size=34,
        ).next_to(relation, DOWN, buff=0.75)

        self.play(FadeIn(old_value, shift=UP * 0.2))
        self.play(Write(times), FadeIn(factor, shift=UP * 0.2))
        self.play(Write(equals), FadeIn(new_value, shift=UP * 0.2))
        self.play(FadeIn(meaning))
        self.next_slide()
        self.play(FadeOut(VGroup(relation, meaning)))

        # Slide 2: translate percentage changes into factors
        heading = Tex("Turn the percentage into a change factor", color=GOLD, font_size=42)
        heading.move_to([0, 1.9, 0])
        grow_rate = MathTex(r"+12\%", color=GROW, font_size=58)
        grow_factor = MathTex(r"1+0.12=1.12", color=GROW, font_size=54)
        drop_rate = MathTex(r"-15\%", color=DROP, font_size=58)
        drop_factor = MathTex(r"1-0.15=0.85", color=DROP, font_size=54)
        grow = VGroup(grow_rate, MathTex(r"\longrightarrow", color=MUTED), grow_factor).arrange(
            RIGHT, buff=0.35
        )
        decay = VGroup(drop_rate, MathTex(r"\longrightarrow", color=MUTED), drop_factor).arrange(
            RIGHT, buff=0.35
        )
        factors = VGroup(grow, decay).arrange(DOWN, buff=0.65).move_to([0, 0, 0])
        note = Tex(
            "Increase: add the rate.  Decrease: subtract the rate.",
            color=MUTED,
            font_size=30,
        ).next_to(factors, DOWN, buff=0.65)

        self.play(FadeIn(heading, shift=DOWN * 0.15))
        self.play(Write(grow))
        self.play(Write(decay))
        self.play(FadeIn(note))
        self.next_slide()
        self.play(FadeOut(VGroup(heading, factors, note)))

        # Slide 3: introduce the example before beginning the working.
        question = Tex(
            r"Rainfall was $2500\text{ mm}$ in 2019.",
            color=OLD,
            font_size=42,
        ).move_to([0, 1.55, 0])
        line_2 = Tex(
            r"In 2020, it increased by $12\%$.",
            color=GROW,
            font_size=42,
        ).next_to(question, DOWN, buff=0.38)
        line_3 = Tex(
            r"In 2021, it decreased by $15\%$.",
            color=DROP,
            font_size=42,
        ).next_to(line_2, DOWN, buff=0.38)
        ask = Tex("Find the rainfall in 2021.", color=GOLD, font_size=40).move_to([0, -1.65, 0])

        self.play(FadeIn(question, shift=DOWN * 0.15))
        self.play(FadeIn(line_2, shift=DOWN * 0.15))
        self.play(FadeIn(line_3, shift=DOWN * 0.15))
        self.play(Write(ask))
        self.next_slide()
        self.play(FadeOut(VGroup(question, line_2, line_3, ask)))

        # Keep this compact version of the question at the top of every
        # calculation slide.  The working below therefore never loses context.
        prompt_1 = Tex(
            r"Question: $2500\text{ mm}$ in 2019, then $+12\%$, then $-15\%$."
            r"  Find 2021 rainfall.",
            color=INK,
            font_size=25,
        ).to_edge(UP, buff=1.35)
        prompt_1.set_color_by_tex("2500", OLD)
        prompt_1.set_color_by_tex("+12", GROW)
        prompt_1.set_color_by_tex("-15", DROP)
        step_1_label = Tex(r"Step 1: apply the 12\% increase", color=GROW, font_size=34)
        step_1_label.move_to([0, 1.25, 0])
        working_1 = MathTex(r"2500 \times 1.12 = 2800", font_size=64).move_to([0, 0.2, 0])
        working_1.set_color_by_tex("2500", OLD)
        working_1.set_color_by_tex("1.12", GROW)
        working_1.set_color_by_tex("2800", NEW)
        explanation_1 = Tex(
            r"The 2020 rainfall is $2800\text{ mm}$.",
            color=MUTED,
            font_size=34,
        ).move_to([0, -1.35, 0])

        # Calculation page 1 of 3.
        self.play(FadeIn(prompt_1, shift=DOWN * 0.1))
        self.play(Write(step_1_label))
        self.play(Write(working_1))
        self.play(FadeIn(explanation_1))
        self.next_slide()
        self.play(FadeOut(VGroup(prompt_1, step_1_label, working_1, explanation_1)))

        prompt_2 = prompt_1.copy()
        carried_step_1 = MathTex(r"\text{Step 1: }2500 \times 1.12 = 2800", font_size=34)
        carried_step_1.set_color_by_tex("2500", OLD)
        carried_step_1.set_color_by_tex("1.12", GROW)
        carried_step_1.set_color_by_tex("2800", NEW)
        carried_step_1.move_to([0, 1.2, 0])
        step_2_label = Tex(r"Step 2: apply the 15\% decrease to 2800", color=DROP, font_size=34)
        step_2_label.move_to([0, 0.25, 0])
        working_2 = MathTex(r"2800 \times 0.85 = 2380", font_size=64).move_to([0, -0.75, 0])
        working_2.set_color_by_tex("2800", NEW)
        working_2.set_color_by_tex("0.85", DROP)
        working_2.set_color_by_tex("2380", GROW)
        explanation_2 = Tex(
            r"The 2021 rainfall is $2380\text{ mm}$.",
            color=MUTED,
            font_size=34,
        ).move_to([0, -1.85, 0])

        # Calculation page 2 of 3: retain step 1 while revealing step 2.
        self.play(FadeIn(prompt_2, shift=DOWN * 0.1))
        self.play(Write(carried_step_1))
        self.play(Write(step_2_label))
        self.play(Write(working_2))
        self.play(FadeIn(explanation_2))
        self.next_slide()
        self.play(FadeOut(VGroup(
            prompt_2, carried_step_1, step_2_label, working_2, explanation_2
        )))

        prompt_3 = prompt_1.copy()
        recap_1 = MathTex(r"2500 \times 1.12 = 2800", font_size=34).move_to([0, 1.2, 0])
        recap_1.set_color_by_tex("2500", OLD)
        recap_1.set_color_by_tex("1.12", GROW)
        recap_1.set_color_by_tex("2800", NEW)
        recap_2 = MathTex(r"2800 \times 0.85 = 2380", font_size=34).move_to([0, 0.65, 0])
        recap_2.set_color_by_tex("2800", NEW)
        recap_2.set_color_by_tex("0.85", DROP)
        recap_2.set_color_by_tex("2380", GROW)
        wrong_label = Tex(
            r"Wrong: do not add $+12\%$ and $-15\%$ directly.",
            color=DROP,
            font_size=29,
        ).move_to([0, 0.02, 0])
        wrong_working = MathTex(
            r"2500 \times (1+0.12-0.15)=2425 \ne 2380",
            color=DROP,
            font_size=40,
        ).move_to([0, -0.55, 0])
        why_wrong = Tex(
            r"The $15\%$ decrease is taken from $2800$, not from $2500$.",
            color=MUTED,
            font_size=28,
        ).move_to([0, -1.12, 0])
        combined = MathTex(r"2500 \times 1.12 \times 0.85 = 2380", font_size=40)
        combined.move_to([0, -1.72, 0])
        combined.set_color_by_tex("2500", OLD)
        combined.set_color_by_tex("1.12", GROW)
        combined.set_color_by_tex("0.85", DROP)
        combined.set_color_by_tex("2380", GROW)
        answer = MathTex(r"\boxed{2380\text{ mm}}", color=GROW, font_size=54).move_to([0, -2.45, 0])

        # Calculation page 3 of 3: retain both steps and contrast the common
        # but invalid "add the percentages" shortcut with the correct method.
        self.play(FadeIn(prompt_3, shift=DOWN * 0.1))
        self.play(Write(recap_1), Write(recap_2))
        self.play(FadeIn(wrong_label), Write(wrong_working))
        self.play(FadeIn(why_wrong))
        self.play(Write(combined))
        self.play(Write(answer))
        self.next_slide()
