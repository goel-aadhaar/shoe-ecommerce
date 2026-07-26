"""Recommendation ML: interactions, collaborative filtering, association rules,
popularity, and hybrid ranking.

Heavy numeric deps (numpy/pandas/scikit-learn/mlxtend) are imported *inside*
functions so the API service stays importable without the ML stack — only the
training path and artifact-backed serving pull them in.
"""
